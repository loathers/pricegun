import { numberFormatter } from "~/utils";

type Props = {
  data: {
    itemId: number;
    quantity: number;
    spend: number;
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
            {item.name} x {numberFormatter.format(item.quantity)}:{" "}
            {numberFormatter.format(item.spend)} meat
          </li>
        ))}
      </ol>
    </section>
  );
}
