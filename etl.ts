import { format, sub, subDays } from "date-fns";
import { prisma } from "./db";
import { query } from "./econ";
import { deriveValue } from "./value";

async function main() {
  const itemIds = await ingestSales();
  await recalculateValues(itemIds);
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

async function recalculateValues(itemIds: number[]) {
  for (const itemId of itemIds) {
    console.log(`(Re)calculating value for item ${itemId}`);
    const sales = await prisma.sale.findMany({
      where: { itemId },
    });
    const value = deriveValue(sales);
    const now = new Date();
    const twoWeeksAgo = subDays(now, 14);
    const volume = sales
      .filter((s) => s.date >= twoWeeksAgo)
      .reduce((acc, s) => acc + s.quantity, 0);
    await prisma.price.upsert({
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
