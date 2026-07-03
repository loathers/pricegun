import type { Database } from "./types.js";
import { Decimal } from "decimal.js";
import { Pool, types } from "pg";
import { Kysely, PostgresDialect, sql } from "kysely";
import { DecimalPlugin } from "./DecimalPlugin.js";
import type { Period } from "./components/PeriodToggle.js";

// Convert NUMERIC values from PostgreSQL to Decimal.js instances when reading
types.setTypeParser(types.builtins.NUMERIC, (value) => new Decimal(value));

const dialect = new PostgresDialect({
  pool: new Pool({
    connectionString: process.env.DATABASE_URL,
  }),
});

export const db = new Kysely<Database>({
  dialect,
  plugins: [new DecimalPlugin()],
});

export async function getVolumeLeaderboard(since: Date) {
  const results = await db
    .selectFrom("Sale")
    .leftJoin("Item", "Sale.itemId", "Item.itemId")
    .select([
      "Sale.itemId",
      "Item.name",
      db.fn.sum<number>("Sale.quantity").as("quantity"),
    ])
    .where("Sale.date", ">=", since)
    .groupBy(["Sale.itemId", "Item.name"])
    .orderBy("quantity", "desc")
    .limit(10)
    .execute();

  return results.map((r) => ({
    ...r,
    name: r.name ?? `[${r.itemId}]`,
    quantity: r.quantity ?? 0,
  }));
}

export async function getSpendLeaderboard(since: Date) {
  const results = await db
    .selectFrom("Sale")
    .leftJoin("Item", "Sale.itemId", "Item.itemId")
    .select([
      "Sale.itemId as itemId",
      "Item.name as name",
      sql<number>`SUM("Sale"."quantity")::integer`.as("quantity"),
      sql<Decimal>`SUM("Sale"."quantity" * "Sale"."unitPrice")`.as("spend"),
    ])
    .where("Sale.date", ">=", since)
    .groupBy(["Sale.itemId", "Item.name"])
    .orderBy("spend", "desc")
    .limit(10)
    .execute();

  return results.map((r) => ({
    ...r,
    name: r.name ?? `[${r.itemId}]`,
    quantity: r.quantity ?? 0,
    spend: r.spend ?? new Decimal(0),
  }));
}

const historyModes = {
  daily: { trunc: "'day'", interval: "'14 days'" },
  weekly: { trunc: "'week'", interval: "'3 months'" },
  monthly: { trunc: "'month'", interval: "'1 year'" },
  all: { trunc: "'week'", interval: null },
} as const;

export async function getSalesHistory(itemId: number, mode: Period = "daily") {
  const { trunc, interval } = historyModes[mode];
  const truncUnit = sql.raw(trunc);

  return await db
    .selectFrom("Sale")
    .select([
      "itemId",
      sql<Date>`date_trunc(${truncUnit}, "date")::date`.as("date"),
      sql<number>`SUM("quantity")::integer`.as("volume"),
      sql<Decimal>`ROUND(AVG("unitPrice"), 2)`.as("price"),
    ])
    .where("itemId", "=", itemId)
    .$if(interval !== null, (qb) =>
      qb.where(
        "Sale.date",
        ">=",
        sql<Date>`NOW() - INTERVAL ${sql.raw(interval!)}`,
      ),
    )
    .groupBy(["itemId", sql<Date>`date_trunc(${truncUnit}, "date")::date`])
    .orderBy("date", "asc")
    .execute();
}

export async function getItemWithSales(
  itemId: number,
  numberOfSales = 20,
  historyMode: Period = "daily",
) {
  const item = await db
    .selectFrom("Item")
    .selectAll()
    .where("Item.itemId", "=", itemId)
    .executeTakeFirst();

  if (!item) return null;

  const sales = await db
    .selectFrom("Sale")
    .select([
      "Sale.date as date",
      "Sale.unitPrice as unitPrice",
      "Sale.quantity as quantity",
    ])
    .where("Sale.itemId", "=", itemId)
    .orderBy("Sale.date", "desc")
    .limit(numberOfSales)
    .execute();

  return {
    ...item,
    sales,
    history: await getSalesHistory(itemId, historyMode),
  };
}

export async function getTotalSales() {
  const { count } = await db
    .selectFrom("Sale")
    .select(({ fn }) => fn.countAll<number>().as("count"))
    .executeTakeFirstOrThrow();
  return count;
}

export async function getAllItems() {
  return db.selectFrom("Item").select(["itemId", "name"]).execute();
}
