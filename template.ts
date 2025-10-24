import { Liquid } from "liquidjs";
export const template = new Liquid();

template.registerFilter(
  "format_number",
  (value, locale = "en-US", options = {}) => {
    if (typeof value !== "number") value = Number(value);
    return value.toLocaleString(locale, options);
  },
);
