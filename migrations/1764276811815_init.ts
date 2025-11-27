// 0001_init_mall_schema.ts

import { Kysely, sql } from "kysely";

export async function up(db: Kysely<any>): Promise<void> {
  await sql`
    DO $$
    BEGIN
      IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'salesource') THEN
        CREATE TYPE "SaleSource" AS ENUM ('mall', 'flea');
      END IF;
    END
    $$;
  `.execute(db);

  await sql`
    CREATE TABLE IF NOT EXISTS "Item" (
      "itemId"   INTEGER PRIMARY KEY,
      "value"    NUMERIC NOT NULL,
      "volume"   INTEGER NOT NULL,
      "date"     TIMESTAMPTZ NOT NULL,
      "name"     TEXT,
      "image"    TEXT NOT NULL DEFAULT 'nopic.gif'
    );
  `.execute(db);

  await sql`
    CREATE TABLE IF NOT EXISTS "Sale" (
      "source"    "SaleSource" NOT NULL,
      "buyerId"   INTEGER      NOT NULL,
      "sellerId"  INTEGER      NOT NULL,
      "itemId"    INTEGER      NOT NULL,
      "quantity"  INTEGER      NOT NULL,
      "unitPrice" NUMERIC      NOT NULL,
      "date"      TIMESTAMPTZ  NOT NULL,
      CONSTRAINT "Sale_pkey"
        PRIMARY KEY ("source", "buyerId", "sellerId", "itemId", "date"),
      CONSTRAINT "Sale_itemId_fkey"
        FOREIGN KEY ("itemId") REFERENCES "Item" ("itemId")
    );
  `.execute(db);

  await sql`DROP TABLE IF EXISTS "_prisma_migrations";`.execute(db);
}

export async function down(db: Kysely<any>): Promise<void> {
  await sql`DROP TABLE IF EXISTS "Sale";`.execute(db);
  await sql`DROP TABLE IF EXISTS "Item";`.execute(db);

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
