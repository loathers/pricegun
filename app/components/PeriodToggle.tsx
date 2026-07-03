import { z } from "zod";

import styles from "./PeriodToggle.module.css";

export const periodSchema = z
  .enum(["daily", "weekly", "monthly", "all"])
  .catch("daily");
export type Period = z.infer<typeof periodSchema>;

type Props = {
  value: Period;
  onChange: (period: Period) => void;
};

const periods: { value: Period; label: string; title: string }[] = [
  { value: "daily", label: "D", title: "Daily for the past two weeks" },
  { value: "weekly", label: "W", title: "Weekly for the past three months" },
  { value: "monthly", label: "M", title: "Monthly for the past year" },
  { value: "all", label: "A", title: "Weekly for all time" },
];

export function PeriodToggle({ value, onChange }: Props) {
  return (
    <div className={styles.group}>
      {periods.map((period) => (
        <button
          key={period.value}
          className={`${styles.button} ${value === period.value ? styles.active : ""}`}
          onClick={() => onChange(period.value)}
          aria-pressed={value === period.value}
          title={period.title}
        >
          {period.label}
        </button>
      ))}
    </div>
  );
}
