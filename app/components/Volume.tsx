import { numberFormatter } from "~/utils";

type Props = {
  data: {
    itemId: number;
    quantity: number;
    name: string;
  }[];
};

export function Volume({ data }: Props) {
  return (
    <section>
      <h2>Top Volume (last 24h)</h2>
      <ol>
        {data.map((item) => (
          <li key={item.itemId}>
            {item.name}: {numberFormatter.format(item.quantity)}
          </li>
        ))}
      </ol>
    </section>
  );
}
