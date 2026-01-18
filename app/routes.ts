import { type RouteConfig, index, route } from "@react-router/dev/routes";

export default [
  index("routes/home.tsx"),
  route("item/:itemid", "routes/item.$itemid.tsx"),
  route("api/:itemid", "routes/api.$itemid.tsx"),
] satisfies RouteConfig;
