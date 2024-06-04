import { test, expect } from "bun:test";
import { deriveValue } from "./value";
import type { SaleData } from "./api";

test("One user's purchases do not disproportionately sway results", () => {
  const baseSale = {
    seller: 1,
    source: "mall" as const,
    item: 1,
    date: new Date(),
  };
  const frequentBuyer = 2;
  const occasionalBuyer1 = 3;
  const occasionalBuyer2 = 4;
  const occasionalBuyer3 = 5;

  const data: SaleData[] = [
    { buyer: frequentBuyer, unitPrice: 10000, quantity: 50, ...baseSale },
    { buyer: frequentBuyer, unitPrice: 11000, quantity: 100, ...baseSale },
    { buyer: frequentBuyer, unitPrice: 10000, quantity: 1, ...baseSale },
    { buyer: occasionalBuyer1, unitPrice: 800, quantity: 2, ...baseSale },
    { buyer: occasionalBuyer2, unitPrice: 700, quantity: 3, ...baseSale },
    { buyer: occasionalBuyer1, unitPrice: 750, quantity: 2, ...baseSale },
    { buyer: occasionalBuyer3, unitPrice: 750, quantity: 3, ...baseSale },
  ];
  const actual = deriveValue(data);

  expect(actual).toBeCloseTo(3221.8129);
});
