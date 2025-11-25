import { data } from "react-router";
import { getSalesHistory, prisma } from "~/db.server.js";
import type { Route } from "./+types/api.$itemid.js";

async function loadItem(itemId: number) {
  const item = await prisma.item.findFirst({
    where: {
      itemId,
    },
    include: {
      sales: {
        orderBy: { date: "asc" },
        take: 20,
        select: {
          date: true,
          unitPrice: true,
          quantity: true,
        },
      },
    },
  });

  if (!item) return null;

  return {
    ...item,
    sales: item.sales.map((sale) => ({
      ...sale,
      unitPrice: sale.unitPrice.toNumber(),
    })),
    value: item.value?.toNumber() ?? null,
    history: await getSalesHistory(itemId),
  };
}

export async function loader({ params }: Route.LoaderArgs) {
  const itemIds = params["itemid"]!.split(",")
    .map(Number)
    .filter(Number.isInteger);

  const itemData = await Promise.all(itemIds.map((itemId) => loadItem(itemId)));

  if (itemData.length === 1) {
    const itemDatum = itemData[0];
    if (!itemDatum)
      return data(
        { error: "Item has not appeared in enough mall searches" },
        404,
      );
    return data(itemDatum);
  }

  return data(itemData);
}
