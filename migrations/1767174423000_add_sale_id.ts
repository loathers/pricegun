import { Kysely, sql } from "kysely";

export async function up(db: Kysely<any>): Promise<void> {
  // Add a new serial id column
  await sql`ALTER TABLE "Sale" ADD COLUMN "id" SERIAL`.execute(db);

  // Drop the composite primary key
  await sql`ALTER TABLE "Sale" DROP CONSTRAINT "Sale_pkey"`.execute(db);

  // Make the new id column the primary key
  await sql`ALTER TABLE "Sale" ADD PRIMARY KEY ("id")`.execute(db);

  // Add an index on date for efficient ETL queries
  await db.schema
    .createIndex("Sale_date_idx")
    .on("Sale")
    .column("date")
    .execute();
}

export async function down(db: Kysely<any>): Promise<void> {
  // Remove the date index
  await db.schema.dropIndex("Sale_date_idx").ifExists().execute();

  // Drop the id primary key
  await sql`ALTER TABLE "Sale" DROP CONSTRAINT "Sale_pkey"`.execute(db);

  // Drop the id column
  await sql`ALTER TABLE "Sale" DROP COLUMN "id"`.execute(db);

  // Restore the composite primary key
  await sql`ALTER TABLE "Sale" ADD PRIMARY KEY ("source", "buyerId", "sellerId", "itemId", "date")`.execute(
    db,
  );
}
