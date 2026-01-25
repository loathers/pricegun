import { data } from "react-router";
import type { Route } from "./+types/api.$itemid.js";
import { getItemWithSales } from "~/db.server.js";
import { serializeDecimals } from "~/hooks/useLoaderDataWithDecimals";

export async function loader({ params, request }: Route.LoaderArgs) {
  const url = new URL(request.url);
  const historyMode =
    url.searchParams.get("history") === "weekly" ? "weekly" : "daily";

  const itemIds = params["itemid"]!.split(",")
    .map(Number)
    .filter(Number.isInteger);

  const itemData = (
    await Promise.all(
      itemIds.map((itemId) => getItemWithSales(itemId, 20, historyMode)),
    )
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

  // Check itemIds here. We may have filtered out ones for which we don't have data
  // but the user will be expecting an array.
  if (itemIds.length === 1) {
    return data(serializeDecimals(itemData[0]), {
      headers: {
        "Access-Control-Allow-Origin": "*",
      },
    });
  }

  return data(serializeDecimals(itemData), {
    headers: {
      "Access-Control-Allow-Origin": "*",
    },
  });
}
