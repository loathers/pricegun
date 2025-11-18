import { useCallback, useMemo } from "react";

import styles from "./ItemSelect.module.css";

export type Item = { itemId: number; name: string | null };

type Props = {
  items: Item[];
  value: Item | null;
  onChange: (value: Item) => void;
};

export function ItemSelect({ items, value, onChange }: Props) {
  const filteredItems = useMemo(
    () => items.sort((a, b) => (a.name ?? "").localeCompare(b.name ?? "")),
    [items, value],
  );

  const handleSelect = useCallback(
    (e: React.ChangeEvent<HTMLSelectElement>) => {
      const itemId = Number(e.target.value);
      const item = items.find((i) => i.itemId === itemId);
      if (item && item.itemId !== value?.itemId) {
        onChange(item);
      }
    },
    [items, onChange, value],
  );

  return (
    <div className={styles.container}>
      <select onChange={handleSelect} value={value?.itemId}>
        <option>[Browse sales history for an item]</option>
        {filteredItems.map((i) => (
          <option key={i.itemId} value={i.itemId}>
            {i.name ?? `[${i.itemId}]`}
          </option>
        ))}
      </select>
    </div>
  );
}
