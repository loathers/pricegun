import type { SaleData } from "./api.js";

export function deriveValue(sales: SaleData[]) {
  if (sales.length === 0) return 0;

  const salesPerBuyer = Object.values(
    Object.groupBy(sales, (i) => i.buyer),
  ).filter((i) => i !== undefined);

  const averagePerBuyer = salesPerBuyer.map((sales) => {
    const [sum, quantity] = sales.reduce(
      (acc, sale) => {
        acc[0] += sale.unitPrice * sale.quantity;
        acc[1] += sale.quantity;
        return acc;
      },
      [0, 0],
    );

    return sum / quantity;
  });

  return (
    averagePerBuyer.reduce((acc, v) => acc + v, 0) / averagePerBuyer.length
  );
}
