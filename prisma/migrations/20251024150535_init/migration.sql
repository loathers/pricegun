-- CreateEnum
CREATE TYPE "SaleSource" AS ENUM('mall', 'flea');

-- CreateTable
CREATE TABLE "Sale" (
  "source" "SaleSource" NOT NULL,
  "buyerId" INTEGER NOT NULL,
  "sellerId" INTEGER NOT NULL,
  "itemId" INTEGER NOT NULL,
  "quantity" INTEGER NOT NULL,
  "unitPrice" INTEGER NOT NULL,
  "date" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "Sale_pkey" PRIMARY KEY ("source", "buyerId", "sellerId", "itemId", "date")
);

-- CreateTable
CREATE TABLE "Price" (
  "value" INTEGER NOT NULL,
  "volume" INTEGER NOT NULL,
  "date" TIMESTAMP(3) NOT NULL,
  "itemId" INTEGER NOT NULL,
  CONSTRAINT "Price_pkey" PRIMARY KEY ("itemId")
);
