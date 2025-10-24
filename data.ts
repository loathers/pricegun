import { createClient } from "data-of-loathing";

const dol = createClient();
const itemNameCache = new Map<number, string>();

export async function findItemNames<T extends { itemId: number }>(values: T[]) {
  return values.map(async (item) => {
    if (!itemNameCache.has(item.itemId)) {
      const { itemById } = await dol.query({
        itemById: { name: true, __args: { id: item.itemId } },
      });
      const name = itemById?.name;
      if (!name) return `Unknown item #${item.itemId}`;
      itemNameCache.set(item.itemId, name);
    }
    return {
      ...item,
      name: itemNameCache.get(item.itemId)!,
    };
  });
}
