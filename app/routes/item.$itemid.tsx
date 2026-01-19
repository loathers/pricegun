import { redirect } from "react-router";

import styles from "./item.module.css";
import { getAllItems, getItemWithSales } from "~/db.server";
import type { Route } from "./+types/item.$itemid";
import {
  serializeDecimals,
  useLoaderDataWithDecimals,
} from "~/hooks/useLoaderDataWithDecimals";
import { ItemSelect } from "~/components/ItemSelect";
import { HomeLink } from "~/components/HomeLink";
import { Chart } from "~/components/Chart";
import { RecentSales } from "~/components/RecentSales";

export function meta({ data }: Route.MetaArgs) {
  const itemName = data?.item?.name ?? "Item";
  return [
    { title: `${itemName} - Pricegun 🏷️🔫` },
    {
      name: "description",
      content: `Price history and recent sales for ${itemName}`,
    },
  ];
}

export async function loader({ params }: Route.LoaderArgs) {
  const itemId = Number(params.itemid);

  if (!Number.isInteger(itemId)) {
    throw redirect("/");
  }

  const item = await getItemWithSales(itemId);

  if (!item) {
    throw redirect("/");
  }

  const items = await getAllItems();

  return serializeDecimals({ item, items });
}

export default function ItemPage() {
  const { item, items } = useLoaderDataWithDecimals<typeof loader>();

  return (
    <div className={styles.container}>
      <HomeLink />
      <h1 className={styles.header}>{item.name ?? `Item ${item.itemId}`}</h1>
      <div className={styles.selector}>
        <label>View a different item:</label>
        <ItemSelect
          items={items}
          value={{ itemId: item.itemId, name: item.name }}
        />
      </div>
      <Chart item={item} />
      <RecentSales
        item={{ itemId: item.itemId, name: item.name }}
        sales={item.sales}
      />
    </div>
  );
}
