import { test, expect, beforeAll, vi, describe } from "vitest";
import { deriveValue } from "./value";
import { Prisma, type Sale } from "../app/generated/prisma/client";

const baseSale = {
  sellerId: 1,
  source: "mall" as const,
  itemId: 1,
};
const BUYER_A = 2;
const BUYER_B = 3;
const BUYER_C = 4;
const BUYER_D = 5;

describe("deriveValue", () => {
  beforeAll(() => {
    vi.setSystemTime(new Date("2024-06-01T00:00:00.000Z"));
  });

  test("Older price drop", () => {
    const data: Sale[] = [
      {
        buyerId: BUYER_A,
        unitPrice: Prisma.Decimal(10000),
        quantity: 50,
        date: new Date("2024-05-20T00:00:00.000Z"),
        ...baseSale,
      },
      {
        buyerId: BUYER_A,
        unitPrice: Prisma.Decimal(11000),
        quantity: 100,
        date: new Date("2024-05-24T00:00:00.000Z"),
        ...baseSale,
      },
      {
        buyerId: BUYER_A,
        unitPrice: Prisma.Decimal(10000),
        quantity: 1,
        date: new Date("2024-05-26T00:00:00.000Z"),
        ...baseSale,
      },
      {
        buyerId: BUYER_B,
        unitPrice: Prisma.Decimal(800),
        quantity: 2,
        date: new Date("2024-05-30T00:00:00.000Z"),
        ...baseSale,
      },
      {
        buyerId: BUYER_C,
        unitPrice: Prisma.Decimal(700),
        quantity: 3,
        date: new Date("2024-05-31T00:00:00.000Z"),
        ...baseSale,
      },
      {
        buyerId: BUYER_B,
        unitPrice: Prisma.Decimal(750),
        quantity: 2,
        date: new Date("2024-05-31T12:00:00.000Z"),
        ...baseSale,
      },
      {
        buyerId: BUYER_D,
        unitPrice: Prisma.Decimal(750),
        quantity: 3,
        date: new Date("2024-05-31T18:00:00.000Z"),
        ...baseSale,
      },
    ];
    const actual = deriveValue(data);

    expect(actual).toEqual(893.41);
  });

  test("Recent price jump", () => {
    const data: Sale[] = [
      {
        buyerId: BUYER_B,
        unitPrice: Prisma.Decimal(800),
        quantity: 2,
        date: new Date("2024-05-30T00:00:00.000Z"),
        ...baseSale,
      },
      {
        buyerId: BUYER_C,
        unitPrice: Prisma.Decimal(700),
        quantity: 3,
        date: new Date("2024-05-31T00:00:00.000Z"),
        ...baseSale,
      },
      {
        buyerId: BUYER_B,
        unitPrice: Prisma.Decimal(750),
        quantity: 2,
        date: new Date("2024-05-31T12:00:00.000Z"),
        ...baseSale,
      },
      {
        buyerId: BUYER_D,
        unitPrice: Prisma.Decimal(750),
        quantity: 3,
        date: new Date("2024-05-31T18:00:00.000Z"),
        ...baseSale,
      },
      {
        buyerId: BUYER_A,
        unitPrice: Prisma.Decimal(10000),
        quantity: 50,
        date: new Date("2024-06-01T00:00:00.000Z"),
        ...baseSale,
      },
      {
        buyerId: BUYER_A,
        unitPrice: Prisma.Decimal(11000),
        quantity: 100,
        date: new Date("2024-06-02T00:00:00.000Z"),
        ...baseSale,
      },
      {
        buyerId: BUYER_A,
        unitPrice: Prisma.Decimal(10000),
        quantity: 1,
        date: new Date("2024-06-02T01:00:00.000Z"),
        ...baseSale,
      },
    ];
    const actual = deriveValue(data);

    expect(actual).toEqual(9572.36);
  });

  test("Gradual price jump", () => {
    const data: Sale[] = [
      {
        buyerId: BUYER_A,
        unitPrice: Prisma.Decimal(500),
        quantity: 50,
        date: new Date("2024-05-20T00:00:00.000Z"),
        ...baseSale,
      },
      {
        buyerId: BUYER_A,
        unitPrice: Prisma.Decimal(510),
        quantity: 100,
        date: new Date("2024-05-24T00:00:00.000Z"),
        ...baseSale,
      },
      {
        buyerId: BUYER_A,
        unitPrice: Prisma.Decimal(520),
        quantity: 1,
        date: new Date("2024-05-26T00:00:00.000Z"),
        ...baseSale,
      },
      {
        buyerId: BUYER_B,
        unitPrice: Prisma.Decimal(550),
        quantity: 2,
        date: new Date("2024-05-30T00:00:00.000Z"),
        ...baseSale,
      },
      {
        buyerId: BUYER_C,
        unitPrice: Prisma.Decimal(580),
        quantity: 3,
        date: new Date("2024-05-31T00:00:00.000Z"),
        ...baseSale,
      },
      {
        buyerId: BUYER_B,
        unitPrice: Prisma.Decimal(600),
        quantity: 2,
        date: new Date("2024-05-31T12:00:00.000Z"),
        ...baseSale,
      },
      {
        buyerId: BUYER_D,
        unitPrice: Prisma.Decimal(625),
        quantity: 3,
        date: new Date("2024-05-31T18:00:00.000Z"),
        ...baseSale,
      },
    ];
    const actual = deriveValue(data);

    expect(actual).toEqual(599.06);
  });

  test("Weird price jump outlier", () => {
    const data: Sale[] = [
      {
        buyerId: BUYER_A,
        unitPrice: Prisma.Decimal(500),
        quantity: 10,
        date: new Date("2024-05-20T00:00:00.000Z"),
        ...baseSale,
      },
      {
        buyerId: BUYER_A,
        unitPrice: Prisma.Decimal(510),
        quantity: 5,
        date: new Date("2024-05-24T00:00:00.000Z"),
        ...baseSale,
      },
      {
        buyerId: BUYER_A,
        unitPrice: Prisma.Decimal(520),
        quantity: 1,
        date: new Date("2024-05-26T00:00:00.000Z"),
        ...baseSale,
      },
      {
        buyerId: BUYER_B,
        unitPrice: Prisma.Decimal(10000),
        quantity: 300,
        date: new Date("2024-05-30T00:00:00.000Z"),
        ...baseSale,
      },
      {
        buyerId: BUYER_C,
        unitPrice: Prisma.Decimal(580),
        quantity: 3,
        date: new Date("2024-05-31T00:00:00.000Z"),
        ...baseSale,
      },
      {
        buyerId: BUYER_B,
        unitPrice: Prisma.Decimal(600),
        quantity: 2,
        date: new Date("2024-05-31T12:00:00.000Z"),
        ...baseSale,
      },
      {
        buyerId: BUYER_D,
        unitPrice: Prisma.Decimal(625),
        quantity: 3,
        date: new Date("2024-05-31T18:00:00.000Z"),
        ...baseSale,
      },
    ];
    const actual = deriveValue(data);

    expect(actual).toEqual(5903.65);
  });

  test("Very low volume", () => {
    const data: Sale[] = [
      {
        buyerId: BUYER_A,
        unitPrice: Prisma.Decimal(70000),
        quantity: 1,
        date: new Date("2024-05-20T00:00:00.000Z"),
        ...baseSale,
      },
      {
        buyerId: BUYER_D,
        unitPrice: Prisma.Decimal(42069),
        quantity: 1,
        date: new Date("2024-05-31T18:00:00.000Z"),
        ...baseSale,
      },
    ];
    const actual = deriveValue(data);

    expect(actual).toEqual(42077.11);
  });

  test("High volume rational market", () => {
    const data: Sale[] = [
      {
        buyerId: BUYER_A,
        unitPrice: Prisma.Decimal(7500),
        quantity: 780,
        date: new Date("2024-05-23T00:00:00.000Z"),
        ...baseSale,
      },
      {
        buyerId: BUYER_A,
        unitPrice: Prisma.Decimal(7600),
        quantity: 600,
        date: new Date("2024-05-24T00:00:00.000Z"),
        ...baseSale,
      },
      {
        buyerId: BUYER_A,
        unitPrice: Prisma.Decimal(7700),
        quantity: 500,
        date: new Date("2024-05-25T00:00:00.000Z"),
        ...baseSale,
      },
      {
        buyerId: BUYER_B,
        unitPrice: Prisma.Decimal(7400),
        quantity: 800,
        date: new Date("2024-05-26T00:00:00.000Z"),
        ...baseSale,
      },
      {
        buyerId: BUYER_C,
        unitPrice: Prisma.Decimal(7450),
        quantity: 750,
        date: new Date("2024-05-27T00:00:00.000Z"),
        ...baseSale,
      },
      {
        buyerId: BUYER_B,
        unitPrice: Prisma.Decimal(7500),
        quantity: 700,
        date: new Date("2024-05-28T12:00:00.000Z"),
        ...baseSale,
      },
      {
        buyerId: BUYER_D,
        unitPrice: Prisma.Decimal(7400),
        quantity: 869,
        date: new Date("2024-05-29T18:00:00.000Z"),
        ...baseSale,
      },
    ];
    const actual = deriveValue(data);

    expect(actual).toEqual(7434.81);
  });

  test("High volume irrational market", () => {
    const data: Sale[] = [
      {
        buyerId: BUYER_A,
        unitPrice: Prisma.Decimal(7500),
        quantity: 700,
        date: new Date("2024-05-23T00:00:00.000Z"),
        ...baseSale,
      },
      {
        buyerId: BUYER_A,
        unitPrice: Prisma.Decimal(7600),
        quantity: 800,
        date: new Date("2024-05-24T00:00:00.000Z"),
        ...baseSale,
      },
      {
        buyerId: BUYER_A,
        unitPrice: Prisma.Decimal(7700),
        quantity: 900,
        date: new Date("2024-05-25T00:00:00.000Z"),
        ...baseSale,
      },
      {
        buyerId: BUYER_B,
        unitPrice: Prisma.Decimal(7400),
        quantity: 400,
        date: new Date("2024-05-26T00:00:00.000Z"),
        ...baseSale,
      },
      {
        buyerId: BUYER_C,
        unitPrice: Prisma.Decimal(7450),
        quantity: 300,
        date: new Date("2024-05-27T00:00:00.000Z"),
        ...baseSale,
      },
      {
        buyerId: BUYER_B,
        unitPrice: Prisma.Decimal(7500),
        quantity: 700,
        date: new Date("2024-05-28T12:00:00.000Z"),
        ...baseSale,
      },
      {
        buyerId: BUYER_D,
        unitPrice: Prisma.Decimal(7400),
        quantity: 500,
        date: new Date("2024-05-29T18:00:00.000Z"),
        ...baseSale,
      },
    ];
    const actual = deriveValue(data);

    expect(actual).toEqual(7443.25);
  });

  test("Very old prices", () => {
    const data: Sale[] = [
      {
        buyerId: BUYER_A,
        unitPrice: Prisma.Decimal(10000),
        quantity: 50,
        date: new Date("2024-03-20T00:00:00.000Z"),
        ...baseSale,
      },
      {
        buyerId: BUYER_A,
        unitPrice: Prisma.Decimal(11000),
        quantity: 100,
        date: new Date("2024-03-24T00:00:00.000Z"),
        ...baseSale,
      },
      {
        buyerId: BUYER_A,
        unitPrice: Prisma.Decimal(10000),
        quantity: 1,
        date: new Date("2024-03-26T00:00:00.000Z"),
        ...baseSale,
      },
      {
        buyerId: BUYER_B,
        unitPrice: Prisma.Decimal(800),
        quantity: 2,
        date: new Date("2024-03-30T00:00:00.000Z"),
        ...baseSale,
      },
      {
        buyerId: BUYER_C,
        unitPrice: Prisma.Decimal(700),
        quantity: 3,
        date: new Date("2024-05-31T00:00:00.000Z"),
        ...baseSale,
      },
      {
        buyerId: BUYER_B,
        unitPrice: Prisma.Decimal(750),
        quantity: 2,
        date: new Date("2024-05-31T12:00:00.000Z"),
        ...baseSale,
      },
      {
        buyerId: BUYER_D,
        unitPrice: Prisma.Decimal(750),
        quantity: 3,
        date: new Date("2024-05-31T18:00:00.000Z"),
        ...baseSale,
      },
    ];
    const actual = deriveValue(data);

    expect(actual).toEqual(736.97);
  });
});
