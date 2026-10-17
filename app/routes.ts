import { type RouteConfig, index, layout, route } from "@react-router/dev/routes";

export default [
  layout("routes/stage.tsx", [
    index("routes/home.tsx"),
    route("role", "routes/role.tsx"),
    route("pictos", "routes/pictos.tsx"),
    route("skills", "routes/skills.tsx"),
  ]),
  // UI kit bench: mounted only with DEV_KIT=true, never in the public build.
  ...(process.env.DEV_KIT === "true" ? [route("dev/kit", "routes/dev.kit.tsx")] : []),
] satisfies RouteConfig;
