import { data } from "react-router";
import { getSalesByDateRange } from "~/db.server.js";
import type { Route } from "./+types/api.sales.$itemid";

const MAX_SALES = 100;

export async function loader({ params, request }: Route.LoaderArgs) {
  const itemIds = params["itemid"]!.split(",")
    .map(Number)
    .filter(Number.isInteger);
  const url = new URL(request.url);
  const startStr = url.searchParams.get("start");
  const endStr = url.searchParams.get("end");
  const limit = parseInt(url.searchParams.get("limit") || "20");

  if (!startStr || !endStr) {
    return data(
      { error: "Missing 'start' or 'end' date" },
      {
        status: 400,
        headers: {
          "Access-Control-Allow-Origin": "*",
        },
      },
    );
  }

  const startDate = new Date(startStr);
  const endDate = new Date(endStr);

  if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
    return data(
      { error: "Invalid date format for 'start' or 'end'" },
      {
        status: 400,
        headers: {
          "Access-Control-Allow-Origin": "*",
        },
      },
    );
  }

  if (startDate > endDate) {
    return data(
      { error: "'start' date must be before 'end' date" },
      {
        status: 400,
        headers: {
          "Access-Control-Allow-Origin": "*",
        },
      },
    );
  }
  if (isNaN(limit) || limit < 1 || limit > MAX_SALES) {
    return data(
      { error: `Limit must be between 1 & ${MAX_SALES}` },
      {
        status: 400,
        headers: {
          "Access-Control-Allow-Origin": "*",
        },
      },
    );
  }

  const itemData = (
    await Promise.all(
      itemIds.map((itemId) =>
        getSalesByDateRange(itemId, startDate, endDate, limit),
      ),
    )
  ).filter((i) => i !== null);

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
