import { Decimal } from "decimal.js";
import { differenceInSeconds } from "date-fns";
import type { Sale } from "~/types";

const VOLUME_EXPONENT = new Decimal(0.5);
const HL = new Decimal(Math.LN2).dividedBy(259_200); // Three days

export function deriveValue(sales: Sale[]): Decimal {
  if (sales.length === 0) return new Decimal(0);

  const epoch = new Date();

  const [numerator, denominator] = sales.reduce(
    ([n, d], s) => {
      const age = differenceInSeconds(epoch, s.date);
      const timeValue = HL.negated().times(age).exp();
      const volumeValue = new Decimal(s.quantity).pow(VOLUME_EXPONENT);
      return [
        s.unitPrice.times(timeValue).times(volumeValue).plus(n),
        d.plus(timeValue.times(volumeValue)),
      ];
    },
    [new Decimal(0), new Decimal(0)],
  );

  return numerator.dividedBy(denominator).toDecimalPlaces(2);
}
