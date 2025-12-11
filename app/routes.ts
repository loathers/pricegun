import { type RouteConfig, index, route } from "@react-router/dev/routes";

export default [
  index("routes/home.tsx"),
  route("api/:itemid", "routes/api.$itemid.tsx"),
  route("api/sales/:itemid", "routes/api.sales.$itemid.tsx"),
] satisfies RouteConfig;
