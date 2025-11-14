import { useMemo } from "react";

export type Item = { itemId: number; name: string | null };

type Props = {
  items: Item[];
  value: Item[];
  onChange: (value: Item[]) => void;
};

export function ItemSelect({ items, value, onChange }: Props) {
  const filteredItems = useMemo(
    () =>
      items
        .filter((i) => !value.some((v) => v.itemId === i.itemId))
        .sort((a, b) => (a.name ?? "").localeCompare(b.name ?? "")),
    [items, value],
  );

  const handleSelect = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const itemId = Number(e.target.value);
    const item = items.find((i) => i.itemId === itemId);
    if (item && !value.some((v) => v.itemId === itemId)) {
      onChange([...value, item]);
    }
  };

  const handleRemove = (e: React.MouseEvent<HTMLButtonElement>) => {
    const itemId = Number(e.currentTarget.dataset.itemid);
    onChange(value.filter((v) => v.itemId !== itemId));
  };

  return (
    <div style={{ display: "flex", flexDirection: "row", gap: "0.5rem" }}>
      <select onChange={handleSelect} disabled={value.length >= 8}>
        <option>[Browse sales history for an item]</option>
        {filteredItems.map((i) => (
          <option key={i.itemId} value={i.itemId}>
            {i.name ?? `[${i.itemId}]`}
          </option>
        ))}
      </select>
      {value.map((i) => (
        <div key={i.itemId}>
          {i.name ?? `[${i.itemId}]`}{" "}
          <button data-itemid={i.itemId} onClick={handleRemove}>
            x
          </button>
        </div>
      ))}
    </div>
  );
}
