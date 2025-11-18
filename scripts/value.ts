import { differenceInSeconds, subDays } from "date-fns";
import { Prisma, type Sale } from "../app/generated/prisma/client.js";

const VOLUME_EXPONENT = 0.5;
const HL = Math.LN2 / 259_200; // Three days

export function deriveValue(sales: Sale[]) {
  if (sales.length === 0) return 0;

  const epoch = new Date();

  const [numerator, denominator] = sales.reduce(
    ([n, d], s) => {
      const age = differenceInSeconds(epoch, s.date);
      const timeValue = Math.exp(-HL * age);
      const volumeValue = s.quantity ** VOLUME_EXPONENT;
      return [
        s.unitPrice.mul(timeValue).mul(volumeValue).add(n),
        d + timeValue * volumeValue,
      ];
    },
    [new Prisma.Decimal(0), 0],
  );

  return numerator.div(denominator).toDecimalPlaces(2).toNumber();
}
