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

export async function getSalesHistory(itemId: number) {
  // This function used to take a list of item ids. I refactored it to take a single
  // item id to simplify its usage, but kept the SQL query the same for now.
  const results = await prisma.$queryRaw<
    {
      itemId: number;
      date: Date;
      volume: BigInt;
      price: Prisma.Decimal;
    }[]
  >`
    SELECT
      "itemId",
      date_trunc('day', "date")::date AS "date",
      SUM("quantity")::integer AS "volume",
      ROUND(AVG("unitPrice"), 2) AS "price"
    FROM
      "Sale"
    WHERE
      "itemId" = ANY (${[itemId]}) AND
      "Sale"."date" >= NOW() - INTERVAL '14 days'
    GROUP BY
      "itemId",
      date_trunc('day', "date")::date
    ORDER BY
      "date" ASC
  `;

  return results.map((r) => ({
    ...r,
    price: r.price.toNumber(),
  }));
}
