import { dateFormatter, numberFormatter } from "~/utils";
import styles from "./RecentSales.module.css";

type Props = {
  sales: { date: Date; unitPrice: number; quantity: number }[];
};

export function RecentSales({ sales }: Props) {
  if (sales.length === 0) return null;
  return (
    <div>
      <h3>Recent Sales</h3>
      <ol className={styles.list}>
        {sales.map((sale) => (
          <li
            key={`${sale.date.toISOString()}-${sale.unitPrice}-${sale.quantity}`}
          >
            {dateFormatter.format(sale.date)} - {sale.quantity} @{" "}
            {numberFormatter.format(sale.unitPrice)}
          </li>
        ))}
      </ol>
    </div>
  );
}
