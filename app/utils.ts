import type { Decimal } from "decimal.js";

export const numberFormatter = new Intl.NumberFormat(undefined);

export function isPOJO(value: unknown): value is Record<string, unknown> {
  if (value === null || typeof value !== "object") {
    return false;
  }

  const proto = Object.getPrototypeOf(value);
  return proto === Object.prototype || proto === null;
}

export function walkObject<T>(
  data: T,
  transform: (value: unknown) => { value: unknown; stop: boolean },
): T {
  const result = transform(data);
  if (result.stop) return result.value as T;

  if (Array.isArray(data)) {
    return data.map((item) => walkObject(item, transform)) as T;
  }
  if (isPOJO(data)) {
    const obj: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(data)) {
      obj[key] = walkObject(value, transform);
    }
    return obj as T;
  }
  return data;
}

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
