import { Decimal } from "decimal.js";
import { useLoaderData } from "react-router";

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

function walkObject<T>(
  data: T,
  transform: (value: unknown) => { value: unknown; stop: boolean },
): T {
  const result = transform(data);
  if (result.stop) return result.value as T;

  if (Array.isArray(data)) {
    return data.map((item) => walkObject(item, transform)) as T;
  }
  if (typeof data === "object" && data !== null) {
    const obj: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(data)) {
      obj[key] = walkObject(value, transform);
    }
    return obj as T;
  }
  return data;
}

export function serializeDecimals<T>(data: T): T {
  return walkObject(data, (value) => {
    if (value instanceof Decimal) {
      return { value: { [DECIMAL_TAG]: value.toString() }, stop: true };
    }
    return { value, stop: false };
  });
}

function hydrateDecimals<T>(data: T): T {
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
