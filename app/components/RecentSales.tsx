import type { Decimal } from "decimal.js";
import { dateFormatter, formatDecimal } from "~/utils";
import styles from "./RecentSales.module.css";
import type { Item } from "./ItemSelect";

type Props = {
  item: Item | null;
  sales: { id: number; date: Date; unitPrice: Decimal; quantity: number }[];
};

export function RecentSales({ item, sales }: Props) {
  if (!item) return null;
  if (sales.length === 0) return null;
  return (
    <div>
      <h3>Recent Sales</h3>
      <ol className={styles.list}>
        {sales.map((sale) => (
          <li
            key={sale.id}
            className={styles.item}
          >
            <span className={styles.badge}>
              {dateFormatter.format(sale.date)}
            </span>
            {sale.quantity} @ {formatDecimal(sale.unitPrice)}
          </li>
        ))}
      </ol>
    </div>
  );
}
