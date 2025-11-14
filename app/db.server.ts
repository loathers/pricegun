import { Prisma, PrismaClient } from "~/generated/prisma/client.js";

export const prisma = new PrismaClient();

export async function getVolumeLeaderboard(since: Date) {
  const results = await prisma.$queryRaw<
    { itemId: number; name: string | null; quantity: number | null }[]
  >`
    SELECT
      "Item"."itemId",
      "Item"."name",
      SUM("Sale"."quantity")::integer AS "quantity"
    FROM
      "Sale"
      LEFT JOIN "Item" ON "Sale"."itemId" = "Item"."itemId"
    WHERE
      "Sale"."date" >= ${since}
    GROUP BY
      "Item"."itemId",
      "Item"."name"
    ORDER BY
      "quantity" DESC
    LIMIT
      10
`;

  return results.map((r) => ({
    ...r,
    name: r.name ?? `[${r.itemId}]`,
    quantity: r.quantity ?? 0,
  }));
}

export async function getSpendLeaderboard(since: Date) {
  const results = await prisma.$queryRaw<
    {
      itemId: number;
      name: string | null;
      quantity: number | null;
      spend: Prisma.Decimal | null;
    }[]
  >`
    SELECT
      "Item"."itemId",
      "Item"."name",
      SUM("Sale"."quantity")::integer AS "quantity",
      SUM("Sale"."quantity" * "Sale"."unitPrice") AS "spend"
    FROM
      "Sale"
      LEFT JOIN "Item" ON "Sale"."itemId" = "Item"."itemId"
    WHERE
      "Sale"."date" >= ${since}
    GROUP BY
      "Item"."itemId",
      "Item"."name"
    ORDER BY
      "spend" DESC
    LIMIT
      10
  `;

  return results.map((r) => ({
    ...r,
    name: r.name ?? `[${r.itemId}]`,
    quantity: r.quantity ?? 0,
    spend: r.spend?.toNumber() ?? 0,
  }));
}

export async function getSalesHistory(itemIds: number[]) {
  return prisma.$queryRaw<
    { itemId: number; date: Date; volume: number; price: number }[]
  >`
    SELECT
      "itemId",
      date_trunc('day', "date")::date AS "date",
      SUM("quantity")::integer AS "volume",
      AVG("unitPrice")::integer AS "price"
    FROM
      "Sale"
    WHERE
      "itemId" = ANY (${itemIds})
    GROUP BY
      "itemId",
      date_trunc('day', "date")::date
    ORDER BY
      "date" ASC
  `;
}
