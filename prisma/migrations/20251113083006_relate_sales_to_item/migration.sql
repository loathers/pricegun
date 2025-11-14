-- AlterTable
ALTER TABLE "Item"
ADD COLUMN "image" TEXT NOT NULL DEFAULT 'nopic.gif',
ADD COLUMN "name" TEXT;

-- AddForeignKey
ALTER TABLE "Sale"
ADD CONSTRAINT "Sale_itemId_fkey" FOREIGN KEY ("itemId") REFERENCES "Item" ("itemId") ON DELETE RESTRICT ON UPDATE CASCADE;
