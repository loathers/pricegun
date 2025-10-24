import { differenceInSeconds, subDays } from "date-fns";
import type { Sale } from "./generated/prisma/client.js";

const VOLUME_EXPONENT = 0.5;

export function deriveValue(sales: Sale[]) {
  if (sales.length === 0) return 0;

  const epoch = subDays(new Date(), 20);

  const [numerator, denominator] = sales.reduce(
    ([n, d], s) => {
      const timeValue = differenceInSeconds(s.date, epoch);
      const volumeValue = s.quantity ** VOLUME_EXPONENT;
      return [
        n + s.unitPrice * timeValue * volumeValue,
        d + timeValue * volumeValue,
      ];
    },
    [0, 0],
  );

  return numerator / denominator;
}
