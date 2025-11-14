-- AlterTable
ALTER TABLE "Price"
RENAME TO "Item";

ALTER TABLE "Item"
RENAME CONSTRAINT "Price_pkey" TO "Item_pkey";
