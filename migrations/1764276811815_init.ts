import { Kysely, sql } from "kysely";

export async function up(db: Kysely<any>): Promise<void> {
  await sql`
    DO $$
    BEGIN
      IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'SaleSource') THEN
        CREATE TYPE "SaleSource" AS ENUM ('mall', 'flea');
      END IF;
    END
    $$;
  `.execute(db);

  db.schema
    .createTable("Item")
    .ifNotExists()
    .addColumn("itemId", "integer", (col) => col.primaryKey())
    .addColumn("value", "numeric", (col) => col.notNull())
    .addColumn("volume", "integer", (col) => col.notNull())
    .addColumn("date", "timestamptz", (col) => col.notNull())
    .addColumn("name", "text")
    .addColumn("image", "text", (col) => col.notNull().defaultTo("'nopic.gif'"))
    .execute();

  db.schema
    .createTable("Sale")
    .ifNotExists()
    .addColumn("source", sql`"SaleSource"`, (col) => col.notNull())
    .addColumn("buyerId", "integer", (col) => col.notNull())
    .addColumn("sellerId", "integer", (col) => col.notNull())
    .addColumn("itemId", "integer", (col) => col.notNull())
    .addColumn("quantity", "integer", (col) => col.notNull())
    .addColumn("unitPrice", "numeric", (col) => col.notNull())
    .addColumn("date", "timestamptz", (col) => col.notNull())
    .addPrimaryKeyConstraint("Sale_pkey", [
      "source",
      "buyerId",
      "sellerId",
      "itemId",
      "date",
    ])
    .addForeignKeyConstraint("Sale_itemId_fkey", ["itemId"], "Item", ["itemId"])
    .execute();

  await db.schema.dropTable("_prisma_migrations").ifExists().execute();
}

export async function down(db: Kysely<any>): Promise<void> {
  await db.schema.dropTable("Sale").ifExists().execute();
  await db.schema.dropTable("Item").ifExists().execute();

  await sql`
    DO $$
    BEGIN
      IF EXISTS (SELECT 1 FROM pg_type WHERE typname = 'salesource') THEN
        DROP TYPE "SaleSource";
      END IF;
    END
    $$;
  `.execute(db);
}
