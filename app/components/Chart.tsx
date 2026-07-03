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
  monthYearFormatter,
  shortDateYearFormatter,
  numberFormatter,
  shortNumberFormatter,
  splitDecimal,
} from "~/utils";
import type { Period } from "~/components/PeriodToggle";

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
  period?: Period;
};

const tickFormatters: Record<Period, Intl.DateTimeFormat> = {
  daily: shortDateFormatter,
  weekly: shortDateFormatter,
  monthly: monthYearFormatter,
  all: shortDateYearFormatter,
};

const tooltipDateOptions: Record<Period, Intl.DateTimeFormatOptions> = {
  daily: { weekday: "short", month: "short", day: "numeric" },
  weekly: { weekday: "short", month: "short", day: "numeric" },
  monthly: { month: "short", year: "numeric" },
  all: { month: "short", day: "numeric", year: "numeric" },
};

export function Chart({ item, period = "daily" }: Props) {
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
            // Recharts cannot handle a bigint, but it can handle a string
            [`price-${h.itemId}`]: splitDecimal(h.price)[0].toString(),
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
            tickFormatters[period].format(new Date(iso))
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
          labelFormatter={(timestamp) =>
            new Date(timestamp as number).toLocaleDateString(
              undefined,
              tooltipDateOptions[period],
            )
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
