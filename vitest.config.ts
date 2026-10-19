import tsconfigPaths from 'vite-tsconfig-paths';
import { defineConfig } from 'vitest/config';

// The app's vite.config.ts runs the React Router plugin, which a unit test does not need.
export default defineConfig({
  plugins: [tsconfigPaths()],
  test: {
    include: ['app/**/*.test.{ts,tsx}'],
    environment: 'node',
    restoreMocks: true
  }
});
