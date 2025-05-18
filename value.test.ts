import { test, expect, beforeAll, setSystemTime } from "bun:test";
import { deriveValue } from "./value";
import type { SaleData } from "./api";

beforeAll(() => {
  setSystemTime(new Date("2024-06-01T00:00:00.000Z"));
});

const baseSale = {
  seller: 1,
  source: "mall" as const,
  item: 1,
};
const BUYER_A = 2;
const BUYER_B = 3;
const BUYER_C = 4;
const BUYER_D = 5;

test("Older price drop", () => {
  const data: SaleData[] = [
    {
      buyer: BUYER_A,
      unitPrice: 10000,
      quantity: 50,
      date: new Date("2024-05-20T00:00:00.000Z"),
      ...baseSale,
    },
    {
      buyer: BUYER_A,
      unitPrice: 11000,
      quantity: 100,
      date: new Date("2024-05-24T00:00:00.000Z"),
      ...baseSale,
    },
    {
      buyer: BUYER_A,
      unitPrice: 10000,
      quantity: 1,
      date: new Date("2024-05-26T00:00:00.000Z"),
      ...baseSale,
    },
    {
      buyer: BUYER_B,
      unitPrice: 800,
      quantity: 2,
      date: new Date("2024-05-30T00:00:00.000Z"),
      ...baseSale,
    },
    {
      buyer: BUYER_C,
      unitPrice: 700,
      quantity: 3,
      date: new Date("2024-05-31T00:00:00.000Z"),
      ...baseSale,
    },
    {
      buyer: BUYER_B,
      unitPrice: 750,
      quantity: 2,
      date: new Date("2024-05-31T12:00:00.000Z"),
      ...baseSale,
    },
    {
      buyer: BUYER_D,
      unitPrice: 750,
      quantity: 3,
      date: new Date("2024-05-31T18:00:00.000Z"),
      ...baseSale,
    },
  ];
  const actual = deriveValue(data);

  expect(actual).toBeCloseTo(6808, 0);
});

test("Recent price jump", () => {
  const data: SaleData[] = [
    {
      buyer: BUYER_B,
      unitPrice: 800,
      quantity: 2,
      date: new Date("2024-05-30T00:00:00.000Z"),
      ...baseSale,
    },
    {
      buyer: BUYER_C,
      unitPrice: 700,
      quantity: 3,
      date: new Date("2024-05-31T00:00:00.000Z"),
      ...baseSale,
    },
    {
      buyer: BUYER_B,
      unitPrice: 750,
      quantity: 2,
      date: new Date("2024-05-31T12:00:00.000Z"),
      ...baseSale,
    },
    {
      buyer: BUYER_D,
      unitPrice: 750,
      quantity: 3,
      date: new Date("2024-05-31T18:00:00.000Z"),
      ...baseSale,
    },
    {
      buyer: BUYER_A,
      unitPrice: 10000,
      quantity: 50,
      date: new Date("2024-06-01T00:00:00.000Z"),
      ...baseSale,
    },
    {
      buyer: BUYER_A,
      unitPrice: 11000,
      quantity: 100,
      date: new Date("2024-06-02T00:00:00.000Z"),
      ...baseSale,
    },
    {
      buyer: BUYER_A,
      unitPrice: 10000,
      quantity: 1,
      date: new Date("2024-06-02T01:00:00.000Z"),
      ...baseSale,
    },
  ];
  const actual = deriveValue(data);

  expect(actual).toBeCloseTo(8169, 0);
});

test("Gradual price jump", () => {
  const data: SaleData[] = [
    {
      buyer: BUYER_A,
      unitPrice: 500,
      quantity: 50,
      date: new Date("2024-05-20T00:00:00.000Z"),
      ...baseSale,
    },
    {
      buyer: BUYER_A,
      unitPrice: 510,
      quantity: 100,
      date: new Date("2024-05-24T00:00:00.000Z"),
      ...baseSale,
    },
    {
      buyer: BUYER_A,
      unitPrice: 520,
      quantity: 1,
      date: new Date("2024-05-26T00:00:00.000Z"),
      ...baseSale,
    },
    {
      buyer: BUYER_B,
      unitPrice: 550,
      quantity: 2,
      date: new Date("2024-05-30T00:00:00.000Z"),
      ...baseSale,
    },
    {
      buyer: BUYER_C,
      unitPrice: 580,
      quantity: 3,
      date: new Date("2024-05-31T00:00:00.000Z"),
      ...baseSale,
    },
    {
      buyer: BUYER_B,
      unitPrice: 600,
      quantity: 2,
      date: new Date("2024-05-31T12:00:00.000Z"),
      ...baseSale,
    },
    {
      buyer: BUYER_D,
      unitPrice: 625,
      quantity: 3,
      date: new Date("2024-05-31T18:00:00.000Z"),
      ...baseSale,
    },
  ];
  const actual = deriveValue(data);

  expect(actual).toBeCloseTo(540, 0);
});

test("Weird price jump outlier", () => {
  const data: SaleData[] = [
    {
      buyer: BUYER_A,
      unitPrice: 500,
      quantity: 10,
      date: new Date("2024-05-20T00:00:00.000Z"),
      ...baseSale,
    },
    {
      buyer: BUYER_A,
      unitPrice: 510,
      quantity: 5,
      date: new Date("2024-05-24T00:00:00.000Z"),
      ...baseSale,
    },
    {
      buyer: BUYER_A,
      unitPrice: 520,
      quantity: 1,
      date: new Date("2024-05-26T00:00:00.000Z"),
      ...baseSale,
    },
    {
      buyer: BUYER_B,
      unitPrice: 10000,
      quantity: 300,
      date: new Date("2024-05-30T00:00:00.000Z"),
      ...baseSale,
    },
    {
      buyer: BUYER_C,
      unitPrice: 580,
      quantity: 3,
      date: new Date("2024-05-31T00:00:00.000Z"),
      ...baseSale,
    },
    {
      buyer: BUYER_B,
      unitPrice: 600,
      quantity: 2,
      date: new Date("2024-05-31T12:00:00.000Z"),
      ...baseSale,
    },
    {
      buyer: BUYER_D,
      unitPrice: 625,
      quantity: 3,
      date: new Date("2024-05-31T18:00:00.000Z"),
      ...baseSale,
    },
  ];
  const actual = deriveValue(data);

  expect(actual).toBeCloseTo(6789, 0);
});

test("Very low volume", () => {
  const data: SaleData[] = [
    {
      buyer: BUYER_A,
      unitPrice: 70000,
      quantity: 1,
      date: new Date("2024-05-20T00:00:00.000Z"),
      ...baseSale,
    },
    {
      buyer: BUYER_D,
      unitPrice: 42069,
      quantity: 1,
      date: new Date("2024-05-31T18:00:00.000Z"),
      ...baseSale,
    },
  ];
  const actual = deriveValue(data);

  expect(actual).toBeCloseTo(50121, 0);
});

test("High volume rational market", () => {
  const data: SaleData[] = [
    {
      buyer: BUYER_A,
      unitPrice: 7500,
      quantity: 780,
      date: new Date("2024-05-23T00:00:00.000Z"),
      ...baseSale,
    },
    {
      buyer: BUYER_A,
      unitPrice: 7600,
      quantity: 600,
      date: new Date("2024-05-24T00:00:00.000Z"),
      ...baseSale,
    },
    {
      buyer: BUYER_A,
      unitPrice: 7700,
      quantity: 500,
      date: new Date("2024-05-25T00:00:00.000Z"),
      ...baseSale,
    },
    {
      buyer: BUYER_B,
      unitPrice: 7400,
      quantity: 800,
      date: new Date("2024-05-26T00:00:00.000Z"),
      ...baseSale,
    },
    {
      buyer: BUYER_C,
      unitPrice: 7450,
      quantity: 750,
      date: new Date("2024-05-27T00:00:00.000Z"),
      ...baseSale,
    },
    {
      buyer: BUYER_B,
      unitPrice: 7500,
      quantity: 700,
      date: new Date("2024-05-28T12:00:00.000Z"),
      ...baseSale,
    },
    {
      buyer: BUYER_D,
      unitPrice: 7400,
      quantity: 869,
      date: new Date("2024-05-29T18:00:00.000Z"),
      ...baseSale,
    },
  ];
  const actual = deriveValue(data);

  expect(actual).toBeCloseTo(7491, 0);
});

test("High volume irrational market", () => {
  const data: SaleData[] = [
    {
      buyer: BUYER_A,
      unitPrice: 7500,
      quantity: 700,
      date: new Date("2024-05-23T00:00:00.000Z"),
      ...baseSale,
    },
    {
      buyer: BUYER_A,
      unitPrice: 7600,
      quantity: 800,
      date: new Date("2024-05-24T00:00:00.000Z"),
      ...baseSale,
    },
    {
      buyer: BUYER_A,
      unitPrice: 7700,
      quantity: 900,
      date: new Date("2024-05-25T00:00:00.000Z"),
      ...baseSale,
    },
    {
      buyer: BUYER_B,
      unitPrice: 7400,
      quantity: 400,
      date: new Date("2024-05-26T00:00:00.000Z"),
      ...baseSale,
    },
    {
      buyer: BUYER_C,
      unitPrice: 7450,
      quantity: 300,
      date: new Date("2024-05-27T00:00:00.000Z"),
      ...baseSale,
    },
    {
      buyer: BUYER_B,
      unitPrice: 7500,
      quantity: 700,
      date: new Date("2024-05-28T12:00:00.000Z"),
      ...baseSale,
    },
    {
      buyer: BUYER_D,
      unitPrice: 7400,
      quantity: 500,
      date: new Date("2024-05-29T18:00:00.000Z"),
      ...baseSale,
    },
  ];
  const actual = deriveValue(data);

  expect(actual).toBeCloseTo(7513, 0);
});
