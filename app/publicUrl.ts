// Files from public/ by their path there: the site may be served from a subfolder (GitHub Pages builds with
// GITHUB_PAGES=true, see vite.config.ts), so root-absolute URLs would miss them.
export const publicUrl = (path: string) => `${import.meta.env.BASE_URL}${path}`;
