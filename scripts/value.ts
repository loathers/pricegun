import { differenceInSeconds, subDays } from "date-fns";
import type { Sale } from "~/types";

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
        s.unitPrice * timeValue * volumeValue + n,
        d + timeValue * volumeValue,
      ];
    },
    [0, 0],
  );

  return Number((numerator / denominator).toFixed(2));
}
