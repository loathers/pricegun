SELECT
  "Item"."itemId",
  "Item"."name",
  SUM("Sale"."quantity")::integer AS "quantity"
FROM
  "Sale"
  LEFT JOIN "Item" ON "Sale"."itemId" = "Item"."itemId"
WHERE
  "Sale"."date" >= $1
GROUP BY
  "Item"."itemId",
  "Item"."name"
ORDER BY
  "quantity" DESC
LIMIT
  10
