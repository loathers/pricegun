import { useMemo, useState, useRef } from "react";
import { useNavigate } from "react-router";
import type { InputActionMeta, SelectInstance, StylesConfig } from "react-select";
import Select from 'react-select';
import { Searcher } from "fast-fuzzy";

import styles from "./ItemSelect.module.css";

export type Item = { itemId: number; name: string | null };

type Props = {
  items: Item[];
  value?: Item | null;
};

export function ItemSelect({ items, value }: Props) {
  const navigate = useNavigate();
  const [query, setQuery] = useState(value?.name ?? "");

  const sortedItems = useMemo(
    () => [...items].sort((a, b) => (a.name ?? "").localeCompare(b.name ?? "")),
    [items],
  );

  const searcher = useMemo(() => {
    return new Searcher(items, {
      ignoreSymbols: true,
      keySelector: (item) => item.name ?? "",
    });
  }, [items]);

  const suggestedItems = useMemo(() => {
    if (query.length === 0) {
      return sortedItems;
    }

    return searcher.search(query).slice(0, 20);
  }, [query, sortedItems, searcher]);

  const selectRef = useRef<SelectInstance<Item, false> | null>(null);
  const handleChange = (selected: Item | null) => {
    if (!selected) return;

    const itemId = Number(selected.itemId);
    if (!Number.isInteger(itemId)) return;

    selectRef.current?.blur(); // lose focus so all text will be selected on next click

    navigate(`/item/${selected.itemId}`);
  };

  const customStyles: StylesConfig<Item, false> = {
    container: (base) => ({
      ...base,
      width: 400,
    }),
    input: (base) => ({
      ...base,
      input: {
        opacity: "1 !important",
      },
    }),
  };

  return (
    <div className={styles.container}>
      <Select<Item, false>
        ref={selectRef}
        options={suggestedItems}
        value={value ?? null}
        inputValue={query}
        onChange={handleChange}
        onInputChange={(newValue: string, meta: InputActionMeta) => {
          if (meta.action === "input-change") {
            setQuery(newValue);
          }
        }}
        onFocus={() => {
          requestAnimationFrame(() => {
            selectRef.current?.inputRef?.select(); // select all text on focus
          });
        }}
        getOptionLabel={(item: Item) => item.name ?? `[${item.itemId}]`}
        getOptionValue={(item: Item) => String(item.itemId)}
        placeholder="Browse sales history for an item"
        isClearable
        styles={customStyles}
      />
    </div>
  );
}