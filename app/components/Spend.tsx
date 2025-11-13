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
            {item.name}: {numberFormatter.format(item.quantity)} for a total of{" "}
            {numberFormatter.format(item.spend)} meat
          </li>
        ))}
      </ol>
    </section>
  );
}
