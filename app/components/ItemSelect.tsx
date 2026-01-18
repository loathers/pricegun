import { useCallback, useMemo } from "react";
import { useNavigate } from "react-router";

import styles from "./ItemSelect.module.css";

export type Item = { itemId: number; name: string | null };

type Props = {
  items: Item[];
  value?: Item | null;
};

export function ItemSelect({ items, value }: Props) {
  const navigate = useNavigate();

  const sortedItems = useMemo(
    () => [...items].sort((a, b) => (a.name ?? "").localeCompare(b.name ?? "")),
    [items],
  );

  const handleSelect = useCallback(
    (e: React.ChangeEvent<HTMLSelectElement>) => {
      const itemId = Number(e.target.value);
      if (!Number.isInteger(itemId)) return;
      navigate(`/item/${itemId}`);
    },
    [navigate],
  );

  return (
    <div className={styles.container}>
      <select onChange={handleSelect} value={value?.itemId ?? ""}>
        <option value="">[Browse sales history for an item]</option>
        {sortedItems.map((i) => (
          <option key={i.itemId} value={i.itemId}>
            {i.name ?? `[${i.itemId}]`}
          </option>
        ))}
      </select>
    </div>
  );
}
