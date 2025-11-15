import {
  Bar,
  CartesianGrid,
  ComposedChart,
  Line,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import { useFetcher } from "react-router";
import { useEffect, useMemo } from "react";

import { type loader as itemLoader } from "../routes/api.$itemid";
import type { Item } from "./ItemSelect";
import { dateFormatter, shortNumberFormatter } from "~/utils";

const COLORS = [
  "#003a7d",
  "#ff73b6",
  "#c701ff",
  "#4ecb8d",
  "#008dff",
  "#ff9d3a",
  "#f9e858",
  "#d83034",
];

type Props = {
  items: Item[];
};

export function Chart({ items }: Props) {
  const fetcher = useFetcher<typeof itemLoader>();

  useEffect(() => {
    if (fetcher.state === "loading") return;
    if (items.length === 0) return;
    fetcher.load(`/api/${items.map((i) => i.itemId).join(",")}`);
  }, [items]);

  const { data, series } = useMemo(() => {
    if (items.length === 0) return { data: [], series: [] };
    if (!fetcher.data || "error" in fetcher.data)
      return { data: [], series: [] };
    const itemData = Array.isArray(fetcher.data)
      ? fetcher.data
      : [fetcher.data];

    const series = itemData.map((item) => ({
      id: item.itemId,
      name: item.name ?? `Item ${item.itemId}`,
      image: item.image,
      volKey: `volume-${item.itemId}`,
      priceKey: `price-${item.itemId}`,
    }));

    const data = Object.values(
      Object.groupBy(
        itemData.flatMap((item) => item.history),
        (h) => h.date!.toISOString(),
      ),
    )
      .filter((day) => day !== undefined)
      .map((day) => {
        return day.reduce(
          (acc, h) => ({
            ...acc,
            [`volume-${h.itemId}`]: h.volume,
            [`price-${h.itemId}`]: h.price,
          }),
          { dateIso: day[0].date!.toISOString(), date: day[0].date },
        );
      });

    return { series, data };
  }, [fetcher.data, items]);

  return (
    <ResponsiveContainer width="100%" height="100%">
      <ComposedChart data={data} barGap={1} barCategoryGap={4}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis
          dataKey="dateIso"
          tickFormatter={(iso: string) => dateFormatter.format(new Date(iso))}
        />
        <YAxis
          yAxisId="left"
          orientation="left"
          allowDecimals={false}
          tickFormatter={(v: number) => shortNumberFormatter.format(v)}
          label={{ value: "Volume", angle: -90, position: "insideLeft" }}
        />
        <YAxis
          yAxisId="right"
          orientation="right"
          tickFormatter={(v: number) => shortNumberFormatter.format(v)}
          label={{ value: `Price`, angle: 90, position: "insideRight" }}
        />
        <Tooltip<number, `${string} Price` | `${string} Volume`>
          labelFormatter={(iso: string) =>
            new Date(iso).toLocaleDateString(undefined, {
              weekday: "short",
              month: "short",
              day: "numeric",
            })
          }
        />
        {series.map((s, i) => (
          <Bar
            key={s.id}
            yAxisId="left"
            dataKey={s.volKey}
            name={`${s.name} Volume`}
            fill={COLORS[i]}
            fillOpacity={0.6}
          />
        ))}
        {series.map((s, i) => (
          <Line
            key={s.id}
            yAxisId="right"
            type="monotone"
            dataKey={s.priceKey}
            name={`${s.name} Price`}
            stroke={COLORS[i]}
            connectNulls
            dot={({ index, cx, cy }) => (
              <image
                key={index}
                href={`http://images.kingdomofloathing.com/itemimages/${s.image}`}
                x={(cx ?? 0) - 5}
                y={(cy ?? 0) - 5}
                width={10}
                height={10}
              />
            )}
            activeDot={({ index, cx, cy }) => (
              <image
                key={index}
                href={`http://images.kingdomofloathing.com/itemimages/${s.image}`}
                x={(cx ?? 0) - 8}
                y={(cy ?? 0) - 8}
                width={16}
                height={16}
              />
            )}
            strokeWidth={2}
          />
        ))}
      </ComposedChart>
    </ResponsiveContainer>
  );
}
