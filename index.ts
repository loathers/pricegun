import { App } from "@tinyhttp/app";
import { cors } from "@tinyhttp/cors";

import { query } from "./api.js";
import { redis } from "./redis.js";
import { deriveValue } from "./value.js";

const TTL = 60 * 60 * 24;

const app = new App();

app
  .use(cors())
  .get("/api/:itemid", async (req, res) => {
    const itemIds = req.params["itemid"]
      .split(",")
      .map(Number)
      .filter(Number.isInteger);

    const results = [];

    for (const itemId of itemIds) {
      const cacheKey = `value:${itemId}`;

      if (!(await redis.exists(cacheKey))) {
        const date = new Date();

        const sales = await query(itemId);

        const value = deriveValue(sales);
        const volume = sales.reduce((acc, s) => acc + s.quantity, 0);

        await redis.set(
          cacheKey,
          JSON.stringify({ value, volume, date, itemId }),
          {
            EX: TTL,
          },
        );
      }

      const result = (await redis.get(cacheKey)) as string;
      results.push(JSON.parse(result));
    }

    return res.send(itemIds.length === 1 ? results[0] : results);
  })
  .get("/", async (_, res) => {
    return res.send("🏷️🔫");
  })
  .listen(3000);
