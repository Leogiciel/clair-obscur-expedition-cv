import { reactRouter } from '@react-router/dev/vite';

import tailwindcss from '@tailwindcss/vite';

import { defineConfig } from 'vite';
import tsconfigPaths from 'vite-tsconfig-paths';

export default defineConfig({
  // Served from the repository's subfolder on GitHub Pages (react-router.config.ts).
  base: process.env.GITHUB_PAGES === 'true' ? '/clair-obscur-expedition-cv/' : '/',
  plugins: [tailwindcss(), reactRouter(), tsconfigPaths()],
  // One stylesheet (≈ 11 KB gzipped) rather than one per component: the dozen render-blocking requests delayed the
  // first paint on mobile; the rendering is pixel-identical.
  build: { cssCodeSplit: false }
});
