import { addDays, format, subDays } from "date-fns";

const BASIC_TOKEN = Buffer.from(`${process.env["USERNAME"]}:${process.env["PASSWORD"]}`).toString("base64");

export type SaleData = {
  source: "mall" | "flea";
  buyer: number;
  seller: number;
  item: number;
  quantity: number;
  unitPrice: number;
  date: Date;
};

function getBounds(
  start: Date | undefined,
  end: Date | undefined,
): [start: Date, end: Date] {
  if (!start) {
    const e = end ?? new Date();
    return [subDays(e, 7), e];
  }

  return [start, end ?? addDays(start, 7)];
}

export function parseLine(line: string): SaleData {
  const parts = line.split(",");
  const quantity = Number(parts[4]);
  return {
    source: parts[0] === "m" ? "mall" : "flea",
    buyer: Number(parts[1]),
    seller: Number(parts[2]),
    item: Number(parts[3]),
    quantity,
    unitPrice: Number(parts[5]) / quantity,
    date: new Date(parts[6]),
  }; 
}

export async function query(
  items: number | number[],
  start?: Date,
  end?: Date,
): Promise<SaleData[]> {
  const [startDate, endDate] = getBounds(start, end);

  const body = new URLSearchParams({
    startstamp: format(startDate, "yyyyMMddHHmmss"),
    endstamp: format(endDate, "yyyyMMddHHmmss"),
    items: Array.isArray(items) ? items.join(",") : items.toString(),
    source: "0",
  });

  const response = await fetch(
    "https://dev.kingdomofloathing.com/econ/result.php",
    {
      method: "POST",
      body,
      headers: new Headers({
        Authorization: `Basic ${BASIC_TOKEN}`,
      }),
    },
  );

  return (await response.text())
    .trim()
    .split("\n")
    .slice(1, -1) // Remove <pre> and </pre>
    .map(parseLine);
}
