import { data } from "react-router";
import { getSalesHistory, prisma } from "~/db.server.js";
import type { Route } from "./+types/api.$itemid.js";

export async function loader({ params }: Route.LoaderArgs) {
  const itemIds = params["itemid"]!.split(",")
    .map(Number)
    .filter(Number.isInteger);

  const items = (
    await prisma.item.findMany({
      where: {
        itemId: { in: itemIds },
      },
    })
  ).map((i) => ({
    ...i,
    value: i.value?.toNumber() ?? null,
  }));

  const history = Object.groupBy(
    await getSalesHistory(itemIds),
    (h) => h.itemId,
  );

  const itemsWithHistory = items.map((item) => ({
    ...item,
    history: history[item.itemId] ?? [],
  }));

  if (itemIds.length === 1) {
    const result = itemsWithHistory[0];
    if (!result)
      return data(
        { error: "Item has not appeared in enough mall searches" },
        404,
      );
    return data(result);
  }

  return data(itemsWithHistory);
}
