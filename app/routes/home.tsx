import { useLoaderData } from "react-router";

import styles from "./home.module.css";
import {
  getAllItems,
  getSpendLeaderboard,
  getTotalSales,
  getVolumeLeaderboard,
} from "~/db.server";
import type { Route } from "./+types/home";
import { Chart } from "~/components/Chart";
import { numberFormatter } from "~/utils";
import { Spend } from "~/components/Spend";
import { Volume } from "~/components/Volume";
import { useEffect, useState } from "react";
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

  const [volume, spend, total, items] = await Promise.all([
    getVolumeLeaderboard(since),
    getSpendLeaderboard(since),
    getTotalSales(),
    getAllItems(),
  ]);

  return { volume, spend, total, items };
}

export default function Home() {
  const { volume, spend, total, items } = useLoaderData<typeof loader>();
  const [selectedItem, setSelectedItem] = useState<Item | null>(null);

  useEffect(() => {
    setSelectedItem((s) => s ?? volume[0]);
  }, [volume]);

  return (
    <div className={styles.homeContainer}>
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
      <section className={styles.chart}>
        <ItemSelect
          items={items}
          value={selectedItem}
          onChange={setSelectedItem}
        />
        <Chart item={selectedItem} />
      </section>
    </div>
  );
}
