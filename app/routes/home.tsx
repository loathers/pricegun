import { useLoaderData } from "react-router";

import { getSpendLeaderboard, getVolumeLeaderboard, prisma } from "~/db.server";
import type { Route } from "./+types/home";
import { Chart } from "~/components/Chart";
import { numberFormatter } from "~/utils";
import { Spend } from "~/components/Spend";
import { Volume } from "~/components/Volume";
import { useState } from "react";
import { ItemSelect, type Item } from "~/components/ItemSelect";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Pricegun 🏷️🔫" },
    {
      name: "description",
      content: "Better pricing and mall tracking for the Kingdom of Loathing",
    },
  ];
}

export async function loader() {
  const since = new Date(Date.now() - 24 * 60 * 60 * 1000);

  const volume = await getVolumeLeaderboard(since);
  const spend = await getSpendLeaderboard(since);
  const total = await prisma.sale.count({});
  const items = await prisma.item.findMany({
    select: { itemId: true, name: true },
  });

  return { volume, spend, total, items };
}

export default function Home() {
  const { volume, spend, total, items } = useLoaderData<typeof loader>();
  const [selectedItems, setSelectedItems] = useState<Item[]>([]);

  return (
    <div style={{ display: "flex" }}>
      <section>
        <header>
          <h1>Pricegun 🏷️ 🔫</h1>
          <p>Now tracking {numberFormatter.format(total)} transactions!</p>
        </header>
        <section>
          <Spend data={spend} />
          <Volume data={volume} />
        </section>
      </section>
      <section style={{ flexBasis: "100%" }}>
        <ItemSelect
          items={items}
          value={selectedItems}
          onChange={setSelectedItems}
        />
        <Chart items={selectedItems} />
      </section>
    </div>
  );
}
