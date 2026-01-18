import { useLoaderData } from "react-router";

import styles from "./home.module.css";
import {
  getAllItems,
  getSpendLeaderboard,
  getTotalSales,
  getVolumeLeaderboard,
} from "~/db.server";
import type { Route } from "./+types/home";
import { numberFormatter } from "~/utils";
import { Spend } from "~/components/Spend";
import { Volume } from "~/components/Volume";
import { ItemSelect } from "~/components/ItemSelect";

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
      <section className={styles.selector}>
        <label>Search for an item to view its price history:</label>
        <ItemSelect items={items} />
      </section>
    </div>
  );
}
