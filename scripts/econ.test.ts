import { expect, test } from "vitest";
import { parseLine } from "./econ";

test("Parse simple mall line", () => {
  const line = "m,1197090,1345884,641,1,100,2024-05-23 12:08:40";
  const actual = parseLine(line);

  expect(actual).toEqual({
    buyer: 1197090,
    seller: 1345884,
    item: 641,
    quantity: 1,
    unitPrice: 100,
    source: "mall",
    date: new Date("2024-05-23 12:08:40"),
  });
});

test("Parse quantity mall line", () => {
  const line = "m,1197090,2270868,641,16,1600,2024-05-30 17:45:29";
  const actual = parseLine(line);

  expect(actual).toEqual({
    buyer: 1197090,
    seller: 2270868,
    item: 641,
    quantity: 16,
    unitPrice: 100,
    source: "mall",
    date: new Date("2024-05-30 17:45:29"),
  });
});

test("Parse flea market line", () => {
  const line = "f,1197090,100105,319,1,720,2024-05-19 03:56:36";
  const actual = parseLine(line);

  expect(actual).toEqual({
    buyer: 1197090,
    seller: 100105,
    item: 319,
    quantity: 1,
    unitPrice: 720,
    source: "flea",
    date: new Date("2024-05-19 03:56:36"),
  });
});
