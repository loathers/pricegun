import { prisma } from "../db.server";

export async function loader() {
  const prices = await prisma.item.findMany({});
  return prices;
}
