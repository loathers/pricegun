import type { Decimal } from "decimal.js";
import { Link } from "react-router";
import { formatDecimal, numberFormatter } from "~/utils";

type Props = {
  data: {
    itemId: number;
    quantity: number;
    spend: Decimal;
    name: string;
  }[];
};

export function Spend({ data }: Props) {
  return (
    <section>
      <h2>Top Spend (last 24h)</h2>
      <ol>
        {data.map((item) => (
          <li key={item.itemId}>
            <Link to={`/item/${item.itemId}`}>{item.name}</Link> x{" "}
            {numberFormatter.format(item.quantity)}:{" "}
            {formatDecimal(item.spend)} meat
          </li>
        ))}
      </ol>
    </section>
  );
}
