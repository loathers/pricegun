import { differenceInSeconds, subDays } from "date-fns";
import { Prisma, type Sale } from "../app/generated/prisma/client.js";

const VOLUME_EXPONENT = 0.5;

export function deriveValue(sales: Sale[]) {
  if (sales.length === 0) return 0;

  const epoch = subDays(new Date(), 20);

  const [numerator, denominator] = sales.reduce(
    ([n, d], s) => {
      const timeValue = differenceInSeconds(s.date, epoch);
      const volumeValue = s.quantity ** VOLUME_EXPONENT;
      return [
        s.unitPrice.mul(timeValue).mul(volumeValue).add(n),
        d + timeValue * volumeValue,
      ];
    },
    [new Prisma.Decimal(0), 0],
  );

  return numerator.div(denominator);
}
