import type { Config } from '@react-router/dev/config';

// GITHUB_PAGES=true builds the static site GitHub Pages serves (.github/workflows/pages.yml): every screen is
// prerendered to HTML under the repository's subfolder, with no server. Otherwise the app is server-rendered, as in
// the Docker image.
const pages = process.env.GITHUB_PAGES === 'true';

export default {
  ssr: !pages,
  prerender: pages,
  basename: pages ? '/clair-obscur-expedition-cv/' : '/'
} satisfies Config;
