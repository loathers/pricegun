import { App } from "@tinyhttp/app";
import { cors } from "@tinyhttp/cors";

import { prisma } from "./db.js";

const app = new App();

app
  .use(cors())
  .get("/api/all", async (_, res) => {
    const prices = await prisma.price.findMany({});
    return res.send(prices);
  })
  .get("/api/:itemid", async (req, res) => {
    const itemIds = req.params["itemid"]
      .split(",")
      .map(Number)
      .filter(Number.isInteger);

    const results = await prisma.price.findMany({
      where: {
        itemId: { in: itemIds },
      },
    });

    if (itemIds.length === 1) {
      const result = results[0];
      if (!result)
        return res.status(404).send({
          error: "Item has not appeared in mall searches in the last 14 days",
        });
      return res.send(result);
    }

    return res.send(results);
  })
  .get("/", async (_, res) => {
    return res.send("🏷️🔫");
  })
  .listen(3000);
