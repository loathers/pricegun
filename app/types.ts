import type { ColumnType, Insertable, Selectable, Updateable } from "kysely";
export type Generated<T> =
  T extends ColumnType<infer S, infer I, infer U>
    ? ColumnType<S, I | undefined, U>
    : ColumnType<T, T | undefined, T>;
export type Timestamp = ColumnType<Date, Date | string, Date | string>;

export const SaleSource = {
  mall: "mall",
  flea: "flea",
} as const;
export type SaleSource = (typeof SaleSource)[keyof typeof SaleSource];
export type ItemTable = {
  value: number;
  volume: number;
  date: Timestamp;
  itemId: number;
  name: string | null;
  image: Generated<string>;
};
export type Item = Selectable<ItemTable>;
export type NewItem = Insertable<ItemTable>;
export type ItemUpdate = Updateable<ItemTable>;

export type SaleTable = {
  id: Generated<number>;
  source: SaleSource;
  buyerId: number;
  sellerId: number;
  itemId: number;
  quantity: number;
  unitPrice: number;
  date: Timestamp;
};
export type Sale = Selectable<SaleTable>;
export type NewSale = Insertable<SaleTable>;
export type SaleUpdate = Updateable<SaleTable>;

export type Database = {
  Item: ItemTable;
  Sale: SaleTable;
};
