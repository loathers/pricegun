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

import { useMemo } from "react";
import {
  shortDateFormatter,
  numberFormatter,
  shortNumberFormatter,
  splitDecimal,
} from "~/utils";

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

import type { Decimal } from "decimal.js";

type ItemData = {
  itemId: number;
  name: string | null;
  image: string | null;
  history: { itemId: number; date: Date; volume: number; price: Decimal }[];
};

type Props = {
  item: ItemData;
};

export function Chart({ item }: Props) {
  const { data, series } = useMemo(() => {
    const series = [
      {
        id: item.itemId,
        name: item.name ?? `Item ${item.itemId}`,
        image: item.image,
        volKey: `volume-${item.itemId}`,
        priceKey: `price-${item.itemId}`,
      },
    ];

    const data = Object.values(
      Object.groupBy(item.history, (h) => h.date!.toISOString()),
    )
      .filter((day) => day !== undefined)
      .map((day) => {
        return day.reduce(
          (acc, h) => ({
            ...acc,
            [`volume-${h.itemId}`]: h.volume,
            [`price-${h.itemId}`]: splitDecimal(h.price)[0],
          }),
          { timestamp: day[0].date!.getTime(), date: day[0].date },
        );
      });

    return { series, data };
  }, [item]);

  return (
    <ResponsiveContainer width="100%" height={600}>
      <ComposedChart data={data} barGap={1} barCategoryGap={4}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis
          dataKey="timestamp"
          type="number"
          scale="time"
          domain={[
            (dataMin: number) => dataMin - 24 * 60 * 60 * 1000,
            (dataMax: number) => dataMax + 24 * 60 * 60 * 1000,
          ]}
          tickFormatter={(iso: string) =>
            shortDateFormatter.format(new Date(iso))
          }
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
          formatter={(value, name) => [
            value && numberFormatter.format(value),
            name,
          ]}
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
