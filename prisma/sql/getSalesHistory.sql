SELECT
  "itemId",
  date_trunc('day', "date")::date AS "date",
  SUM("quantity")::integer AS "volume",
  AVG("unitPrice")::integer AS "price"
FROM
  "Sale"
WHERE
  "itemId" = ANY ($1)
GROUP BY
  "itemId",
  date_trunc('day', "date")::date
ORDER BY
  "date" ASC
