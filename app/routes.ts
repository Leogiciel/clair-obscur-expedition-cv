import { type RouteConfig, index, layout, route } from "@react-router/dev/routes";

export default [
  layout("routes/stage.tsx", [
    index("routes/home.tsx"),
    route("experience", "routes/experience.tsx"),
    route("pictos", "routes/pictos.tsx"),
    route("skills", "routes/skills.tsx"),
    route("luminas", "routes/luminas.tsx"),
    route("skill-tree", "routes/skilltree.tsx"),
  ]),
  // UI kit bench: mounted only with DEV_KIT=true, never in the public build.
  ...(process.env.DEV_KIT === "true" ? [route("dev/kit", "routes/dev.kit.tsx")] : []),
] satisfies RouteConfig;
