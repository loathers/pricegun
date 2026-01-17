import { Kysely } from "kysely";

export async function up(db: Kysely<any>): Promise<void> {
  await db.schema
    .createIndex("Sale_itemId_date_idx")
    .on("Sale")
    .columns(["itemId", "date desc"])
    .execute();
}

export async function down(db: Kysely<any>): Promise<void> {
  await db.schema.dropIndex("Sale_itemId_date_idx").ifExists().execute();
}
