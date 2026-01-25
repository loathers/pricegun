import styles from "./PeriodToggle.module.css";

export type Period = "daily" | "weekly";

type Props = {
  value: Period;
  onChange: (period: Period) => void;
};

const periods: { value: Period; label: string; title: string }[] = [
  { value: "daily", label: "D", title: "Daily for the past two weeks" },
  { value: "weekly", label: "W", title: "Weekly for the past three months" },
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
