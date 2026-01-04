import { format, sub, subDays } from "date-fns";
import { createClient } from "data-of-loathing";

import { db } from "../app/db.server";
import { query, type SaleResponse } from "./econ";
import { deriveValue } from "./value";

const MIN_SALES = 20;
const RECENT_CUTOFF_DAYS = 14;

const dol = createClient();

function chunkArray<T>(arr: T[], size: number): T[][] {
  return Array.from({ length: Math.ceil(arr.length / size) }, (_, i) =>
    arr.slice(i * size, i * size + size),
  );
}

async function main() {
  const args = process.argv.slice(2);
  if (args.includes("--revalue")) return await recalculateAllValues();
  const itemIds = await ingestSales();
  await recalculateValues(itemIds);
  await fetchItemData();
}

async function recalculateAllValues() {
  const itemIds = (
    await db
      .selectFrom("Item")
      .select("itemId")
      .orderBy("itemId", "asc")
      .execute()
  ).map((i) => i.itemId);
  await recalculateValues(itemIds);
}

async function fetchItemData() {
  const unknown = await db
    .selectFrom("Item")
    .select("itemId")
    .where("name", "is", null)
    .execute();

  const data = (
    unknown.length > 20
      ? ((
          await dol.query({
            allItems: { nodes: { id: true, name: true, image: true } },
          })
        ).allItems?.nodes ?? [])
      : await Promise.all(
          unknown.map(
            async (item) =>
              (
                await dol.query({
                  itemById: {
                    id: true,
                    name: true,
                    image: true,
                    __args: { id: item.itemId },
                  },
                })
              ).itemById,
          ),
        )
  ).filter((i) => i !== null);

  await db.transaction().execute(async (tx) => {
    for (const d of data) {
      await tx
        .updateTable("Item")
        .set({ name: d.name, image: d.image })
        .where("itemId", "=", d.id)
        .execute();
    }
  });
}

function salesMatch(
  apiSale: SaleResponse,
  dbSale: {
    source: string;
    buyerId: number;
    sellerId: number;
    itemId: number;
    quantity: number;
    unitPrice: string | number;
    date: Date;
  },
) {
  return (
    apiSale.source === dbSale.source &&
    apiSale.buyer === dbSale.buyerId &&
    apiSale.seller === dbSale.sellerId &&
    apiSale.item === dbSale.itemId &&
    apiSale.quantity === dbSale.quantity &&
    apiSale.unitPrice === Number(dbSale.unitPrice) &&
    apiSale.date.getTime() === dbSale.date.getTime()
  );
}

async function getLatestSaleDate() {
  const latest = await db
    .selectFrom("Sale")
    .select("date")
    .orderBy("date", "desc")
    .limit(1)
    .executeTakeFirst();

  return sub(latest?.date ?? new Date(0), { seconds: 1 });
}

async function getExistingSales(since: Date) {
  return await db
    .selectFrom("Sale")
    .select([
      "source",
      "buyerId",
      "sellerId",
      "itemId",
      "quantity",
      "unitPrice",
      "date",
    ])
    .where("date", ">=", since)
    .orderBy("date", "asc")
    .execute();
}

function findSalesToSkip(
  sales: SaleResponse[],
  existingSales: Awaited<ReturnType<typeof getExistingSales>>,
): number {
  if (sales.length === 0) return 0;

  for (let i = 0; i < existingSales.length; i++) {
    if (!salesMatch(sales[0], existingSales[i])) continue;

    // Found candidate, count consecutive matches
    let matchCount = 1;
    let crossedBoundary = false;

    while (matchCount < sales.length && i + matchCount < existingSales.length) {
      if (!salesMatch(sales[matchCount], existingSales[i + matchCount])) {
        break; // Stop at first mismatch
      }

      if (
        sales[matchCount].date.getTime() !==
        sales[matchCount - 1].date.getTime()
      ) {
        crossedBoundary = true;
      }
      matchCount++;
    }

    // Accept if we crossed a timestamp boundary OR matched to end of existingSales
    if (crossedBoundary || i + matchCount >= existingSales.length) {
      return matchCount;
    }
  }

  return 0; // No confident match, don't skip any
}

async function ingestSales() {
  const since = await getLatestSaleDate();

  const sales = await query(null, since);

  console.log(
    `Found ${sales.length} sales since ${format(since, "yyyy-MM-dd HH:mm:ss")}`,
  );

  // Fetch existing sales from the same time period in chronological order
  const existingSales = await getExistingSales(since);

  const salesToSkip = findSalesToSkip(sales, existingSales);
  const newSales = sales.slice(salesToSkip);

  console.log(`${newSales.length} new sales to insert`);

  const chunks = chunkArray(newSales, 1000);

  // Create the items first to avoid foreign key violations
  for (const chunk of chunks) {
    await db
      .insertInto("Item")
      .values(
        chunk.map((s) => ({
          itemId: s.item,
          value: 0,
          volume: 0,
          date: new Date(0),
        })),
      )
      .onConflict((oc) => oc.doNothing())
      .execute();
  }

  // Insert sales
  for (const chunk of chunks) {
    await db
      .insertInto("Sale")
      .values(
        chunk.map((s) => ({
          date: s.date,
          unitPrice: s.unitPrice,
          quantity: s.quantity,
          source: s.source,
          itemId: s.item,
          buyerId: s.buyer,
          sellerId: s.seller,
        })),
      )
      .execute();
  }

  return [...new Set(newSales.map((s) => s.item))];
}

async function getGreaterOfRecentOrMinSales(
  itemId: number,
  recentCutoff: Date,
  minSales: number,
) {
  const recent = await db
    .selectFrom("Sale")
    .selectAll()
    .where("itemId", "=", itemId)
    .where("date", ">=", recentCutoff)
    .orderBy("date", "desc")
    .execute();

  if (recent.length >= minSales) {
    return recent;
  }

  return await db
    .selectFrom("Sale")
    .selectAll()
    .where("itemId", "=", itemId)
    .orderBy("date", "desc")
    .limit(minSales)
    .execute();
}

export async function recalculateValues(itemIds: number[]) {
  for (const itemId of itemIds.sort((a, b) => a - b)) {
    console.log(`(Re)calculating value for item ${itemId}`);

    const now = new Date();
    const recentCutoff = subDays(now, RECENT_CUTOFF_DAYS);

    const sales = await getGreaterOfRecentOrMinSales(
      itemId,
      recentCutoff,
      MIN_SALES,
    );

    const value = deriveValue(sales);

    const volume = sales
      .filter((s) => s.date >= recentCutoff)
      .reduce((acc, s) => acc + s.quantity, 0);

    await db
      .insertInto("Item")
      .values({
        itemId,
        value,
        volume,
        date: now,
      })
      .onConflict((oc) =>
        oc.column("itemId").doUpdateSet({
          value,
          volume,
          date: now,
        }),
      )
      .execute();
  }
}

main();
