import { useCallback, useMemo, useState } from "react";
import { useNavigate } from "react-router";

import styles from "./ItemSelect.module.css";
import Autocomplete from "@mui/material/Autocomplete";
import TextField from "@mui/material/TextField";
import {Searcher} from "fast-fuzzy";

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
    })
  }, [items])

  const suggestedItems = useMemo(() => {
    if (query.length === 0) {
      return sortedItems
    }

    let matchedItems = searcher.search(query)

    return matchedItems.slice(0, 20)
  }, [query, sortedItems]);

  const handleSelect =  (_: any, newValue: Item | null) => {
      if (newValue == null) {
        return;
      }
      const itemId = Number(newValue.itemId);
      if (!Number.isInteger(itemId)) return;
      navigate(`/item/${itemId}`);
    };

  return (
    <div className={styles.container}>
      <Autocomplete<Item, false, false, false>
        sx={{ width: 400 }}
        options={suggestedItems}
        getOptionLabel={(option) => option.name ?? `[${option.itemId}]`}
        isOptionEqualToValue={(option, value) =>
          option.itemId === value.itemId
        }
        value={value ?? null}
        inputValue={query}
        selectOnFocus
        onChange={handleSelect}
        onInputChange={(_, newInput) => {
          setQuery(newInput);
        }}
        renderInput={(params) => (
          <TextField
            {...params}
            label="Browse sales history for an item"
            variant="outlined"
            size="small"
          />
        )}
      />
    </div>
  );
}