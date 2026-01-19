import type { Decimal } from "decimal.js";

export const numberFormatter = new Intl.NumberFormat(undefined);

export function splitDecimal(
  value: Decimal,
): [intPart: bigint, decPart: string] {
  const [intPart, decPart] = value.toFixed().split(".") as [string, string];
  return [BigInt(intPart), decPart ?? ""];
}

export function formatDecimal(value: Decimal): string {
  const [intPart, decPart] = splitDecimal(value);
  const formattedInt = numberFormatter.format(intPart);
  return decPart ? `${formattedInt}.${decPart}` : formattedInt;
}
export const shortNumberFormatter = new Intl.NumberFormat(undefined, {
  notation: "compact",
  compactDisplay: "short",
});
export const shortDateFormatter = new Intl.DateTimeFormat(undefined, {
  month: "short",
  day: "numeric",
});

export const dateFormatter = new Intl.DateTimeFormat(undefined, {
  dateStyle: "short",
  timeStyle: "short",
});
