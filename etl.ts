import { subDays } from "date-fns";
import { prisma } from "./db";
import { query } from "./econ";
import { deriveValue } from "./value";

async function main() {
  const itemIds = await ingestSales();
  await recalculateValues(itemIds);
}

async function ingestSales() {
  const sales = await query(null);

  await prisma.sale.createMany({
    data: sales.map((s) => ({
      ...s,
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
