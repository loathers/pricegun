import { format, sub, subDays } from "date-fns";
import { createClient } from "data-of-loathing";

import { prisma } from "../app/db.server";
import { query } from "./econ";
import { deriveValue } from "./value";
import type { Sale } from "~/generated/prisma/client";

const MIN_SALES = 20;

const dol = createClient();

async function main() {
  const args = process.argv.slice(2);
  const itemIds = args.includes("--revalue")
    ? (await prisma.item.findMany({ select: { itemId: true } })).map(
        (i) => i.itemId,
      )
    : await ingestSales();
  await recalculateValues(itemIds);
  await fetchItemData();
}

async function fetchItemData() {
  const unknown = await prisma.item.findMany({
    where: { name: null },
    select: { itemId: true },
  });

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

  await prisma.$transaction(
    data.map((d) =>
      prisma.item.updateMany({
        where: { itemId: d.id },
        data: { name: d.name, image: d.image },
      }),
    ),
  );
}

async function ingestSales() {
  const latest = await prisma.sale.findFirst({
    orderBy: { date: "desc" },
  });
  const since = sub(latest?.date ?? new Date(0), { seconds: 1 });

  const sales = await query(null, since);

  console.log(
    `Found ${sales.length} sales since ${format(since, "yyyy-MM-dd HH:mm:ss")}`,
  );

  // Create the items first to avoid foreign key violations
  await prisma.item.createMany({
    data: sales.map((s) => ({
      itemId: s.item,
      value: 0,
      volume: 0,
      date: new Date(0),
    })),
    skipDuplicates: true,
  });

  await prisma.sale.createMany({
    data: sales.map((s) => ({
      date: s.date,
      unitPrice: s.unitPrice,
      quantity: s.quantity,
      source: s.source,
      itemId: s.item,
      buyerId: s.buyer,
      sellerId: s.seller,
    })),
    skipDuplicates: true,
  });

  return [...new Set(sales.map((s) => s.item))];
}

async function getGreaterOfLastTwoWeeksOrMinSales(itemId: number) {
  const twoWeeksAgo = subDays(new Date(), 14);
  const recent = await prisma.sale.findMany({
    where: {
      itemId,
      date: { gte: twoWeeksAgo },
    },
    orderBy: { date: "desc" },
  });

  if (recent.length >= MIN_SALES) {
    return recent;
  }

  return await prisma.sale.findMany({
    where: { itemId },
    orderBy: { date: "desc" },
    take: MIN_SALES,
  });
}

async function recalculateValues(itemIds: number[]) {
  for (const itemId of itemIds.sort()) {
    console.log(`(Re)calculating value for item ${itemId}`);

    const sales = await getGreaterOfLastTwoWeeksOrMinSales(itemId);

    const value = deriveValue(sales);
    const now = new Date();
    const twoWeeksAgo = subDays(now, 14);
    const volume = sales
      .filter((s) => s.date >= twoWeeksAgo)
      .reduce((acc, s) => acc + s.quantity, 0);
    const r = await prisma.item.upsert({
      where: { itemId },
      create: {
        itemId,
        value,
        volume,
        date: now,
      },
      update: {
        value,
        volume,
        date: now,
      },
    });
  }
}

main();
