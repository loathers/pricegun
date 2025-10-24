import { App } from "@tinyhttp/app";
import { cors } from "@tinyhttp/cors";

import { prisma } from "./db.js";
import { template } from "./template.js";
import { findItemNames } from "./data.js";

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
    const since = new Date(Date.now() - 24 * 60 * 60 * 1000);

    const volume = await prisma.sale.groupBy({
      by: ["itemId"],
      where: {
        date: { gte: since },
      },
      _sum: { quantity: true },
      orderBy: {
        _sum: { quantity: "desc" },
      },
      take: 10,
    });

    const spend = await prisma.$queryRaw<
      { itemId: number; quantity: number; spend: number }[]
    >`
      SELECT "itemId",
       SUM("quantity") as "quantity",
       SUM("quantity" * "unitPrice") AS "spend"
      FROM "Sale"
      WHERE "date" >= ${since}
      GROUP BY "itemId"
      ORDER BY "spend" DESC
      LIMIT 10
    `;

    const page = await template.parseAndRender(
      `
      <h1>Pricegun 🏷️🔫</h1>
      <h2>Top Spend (last 24h)</h2>
      <ol>
      {% for item in spend %}
      <li>{{ item.name }}: {{ item.quantity | format_number }} for a total of {{ item.spend | format_number }} meat</li>
      {% endfor %}
      </ol>
      <h2>Top Volume (last 24h)</h2>
      <ol>
      {% for item in volume %}
      <li>{{ item.name }}: {{ item._sum.quantity | format_number }}</li>
      {% endfor %}
      </ol>
    `,
      {
        volume: await findItemNames(volume),
        spend: await findItemNames(spend),
      },
    );
    return res.send(page);
  })
  .listen(3000, () => {
    console.log("Server running on port 3000");
  });
