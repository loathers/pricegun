import { App } from "@tinyhttp/app";
import { cors } from "@tinyhttp/cors";

import { query } from "./api.js";
import { redis } from "./redis.js";
import { deriveValue } from "./value.js";

const HOUR = 60 * 60;

const app = new App();

app
  .use(cors())
  .get("/api/all", async (_, res) => {
    if (!(await redis.exists("all"))) {
      const date = new Date();

      const sales = await query(null);

      let batch = redis.multi();

      for (const [itemId, itemSales] of Object.entries(
        Object.groupBy(sales, (s) => s.item),
      )) {
        if (!itemSales) continue;
        const cacheKey = `value:${itemId}`;
        const value = deriveValue(itemSales);
        const volume = itemSales.reduce((acc, s) => acc + s.quantity, 0);

        batch = batch.set(
          cacheKey,
          JSON.stringify({
            value,
            volume,
            date,
            itemId: Number(itemId),
          }),
          {
            EX: HOUR * 24,
          },
        );
      }

      await batch
        .set("all", "true", {
          EX: HOUR * 24,
        })
        .exec();
    }

    const keys = await Array.fromAsync(
      redis.scanIterator({ MATCH: "value:*" }),
    );
    
    return res.send(
      (await redis.mGet(keys))
        .filter((v) => v !== null)
        .map((v) => JSON.parse(v)),
    );
  })
  .get("/api/:itemid", async (req, res) => {
    const itemIds = req.params["itemid"]
      .split(",")
      .map(Number)
      .filter(Number.isInteger);

    const results = [];

    const sales = await query(itemIds);

    for (const [itemId, itemSales] of Object.entries(
      Object.groupBy(sales, (s) => s.item),
    )) {
      if (!itemSales) continue;

      const cacheKey = `value:${itemId}`;

      if (!(await redis.exists(cacheKey))) {
        const date = new Date();

        const value = deriveValue(itemSales);
        const volume = sales.reduce((acc, s) => acc + s.quantity, 0);

        await redis.set(
          cacheKey,
          JSON.stringify({ value, volume, date, itemId }),
          {
            EX: HOUR * 12,
          },
        );
      }

      const result = (await redis.get(cacheKey)) as string;
      results.push(JSON.parse(result));
    }

    if (itemIds.length === 1) {
      const result = results[0];
      if (!result)
        return res
          .status(404)
          .send({ error: "Item has not appeared in mall searches in the last 14 days" });
      return res.send(result);
    }

    return res.send(results);
  })
  .get("/", async (_, res) => {
    return res.send("🏷️🔫");
  })
  .listen(3000);
