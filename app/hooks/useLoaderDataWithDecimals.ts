import { Decimal } from "decimal.js";
import { useLoaderData } from "react-router";
import { walkObject } from "~/utils";

// Tagged serialization for Decimals across the client/server boundary
const DECIMAL_TAG = "__decimal__" as const;

type SerializedDecimal = { [DECIMAL_TAG]: string };

function isSerializedDecimal(value: unknown): value is SerializedDecimal {
  return (
    typeof value === "object" &&
    value !== null &&
    DECIMAL_TAG in value &&
    typeof (value as SerializedDecimal)[DECIMAL_TAG] === "string"
  );
}

export function serializeDecimals<T>(data: T): T {
  return walkObject(data, (value) => {
    if (value instanceof Decimal) {
      return { value: { [DECIMAL_TAG]: value.toString() }, stop: true };
    }
    return { value, stop: false };
  });
}

export function hydrateDecimals<T>(data: T): T {
  return walkObject(data, (value) => {
    if (isSerializedDecimal(value)) {
      return { value: new Decimal(value[DECIMAL_TAG]), stop: true };
    }
    return { value, stop: false };
  });
}

export function useLoaderDataWithDecimals<
  T extends (...args: never[]) => unknown,
>(): Awaited<ReturnType<T>> {
  const data = useLoaderData<T>();
  return hydrateDecimals(data) as Awaited<ReturnType<T>>;
}
