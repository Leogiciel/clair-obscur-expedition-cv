import { type RouteConfig, index, route } from "@react-router/dev/routes";

export default [
  index("routes/home.tsx"),
  route("role", "routes/role.tsx"),
  // UI kit bench: mounted only with DEV_KIT=true, never in the public build.
  ...(process.env.DEV_KIT === "true" ? [route("dev/kit", "routes/dev.kit.tsx")] : []),
] satisfies RouteConfig;
