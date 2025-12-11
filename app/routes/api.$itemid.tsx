import { data } from "react-router";
import type { Route } from "./+types/api.$itemid.js";
import { getItemWithSales } from "~/db.server.js";

export async function loader({ params }: Route.LoaderArgs) {
  const itemIds = params["itemid"]!.split(",")
    .map(Number)
    .filter(Number.isInteger);

  const itemData = (
    await Promise.all(itemIds.map((itemId) => getItemWithSales(itemId)))
  ).filter((i) => i !== null);

  if (itemData.length === 0) {
    return data(
      { error: "Not enough mall data to service request" },
      {
        status: 404,
        headers: {
          "Access-Control-Allow-Origin": "*",
        },
      },
    );
  }

  if (itemData.length === 1) {
    return data(itemData[0], {
      status: 200,
      headers: {
        "Access-Control-Allow-Origin": "*",
      },
    });
  }

  return data(itemData, {
    status: 200,
    headers: {
      "Access-Control-Allow-Origin": "*",
    },
  });
}
