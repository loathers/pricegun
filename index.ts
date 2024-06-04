import { App } from "@tinyhttp/app";
import { query } from "./api.js";
import { redis } from "./redis.js";
import { deriveValue } from "./value.js";

const TTL = 60 * 60 * 24;

const app = new App();

app
  .get("/api/:itemid", async (req, res) => {
    const itemId = Number(req.params["itemid"]);

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

    const result = await redis.get(cacheKey);
    return res.json(result);
  })
  .get("/", async (_, res) => {
    return res.send("🏷️🔫");
  })
  .listen(3000);
