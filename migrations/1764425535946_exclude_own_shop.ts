import type { Kysely } from "kysely";
import { recalculateValues } from "../scripts/etl.js";

export async function up(db: Kysely<any>): Promise<void> {
  const items = await db
    .deleteFrom("Sale")
    .whereRef("buyerId", "=", "sellerId")
    .returning("itemId")
    .execute();

  if (items.length > 0) {
    await recalculateValues([...new Set(items.map((i) => i.itemId))]);
  }
}
