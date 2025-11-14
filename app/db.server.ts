import { getSpendLeaderboard } from "~/generated/prisma/sql/getSpendLeaderboard.js";
import { getVolumeLeaderboard } from "~/generated/prisma/sql/getVolumeLeaderboard.js";
import { PrismaClient } from "~/generated/prisma/client.js";

export const prisma = new PrismaClient();

export async function mostVolume(since: Date) {
  const results = await prisma.$queryRawTyped(getVolumeLeaderboard(since));

  return results.map((r) => ({
    ...r,
    name: r.name ?? `[${r.itemId}]`,
    quantity: r.quantity ?? 0,
  }));
}

export async function mostSpend(since: Date) {
  const results = await prisma.$queryRawTyped(getSpendLeaderboard(since));

  return results.map((r) => ({
    ...r,
    name: r.name ?? `[${r.itemId}]`,
    quantity: r.quantity ?? 0,
    spend: r.spend?.toNumber() ?? 0,
  }));
}
