import { PrismaClient } from "./generated/prisma/client.js";

export const prisma = new PrismaClient();

export async function getVolumeLeaderboard(since: Date) {
  return await prisma.sale.groupBy({
    by: ["itemId"],
    where: {
      date: { gte: since },
    },
    _sum: { quantity: true },
    orderBy: {
      _sum: { quantity: "desc" },
    },
    take: 10,
  });
}

export async function getSpendLeaderboard(since: Date) {
  return await prisma.$queryRaw<
    { itemId: number; quantity: number; spend: number }[]
  >`
    SELECT "itemId",
    SUM("quantity") as "quantity",
    SUM("quantity" * "unitPrice") AS "spend"
    FROM "Sale"
    WHERE "date" >= ${since}
    GROUP BY "itemId"
    ORDER BY "spend" DESC
    LIMIT 10
  `;
}
