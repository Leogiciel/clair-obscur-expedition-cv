import reactHooks from 'eslint-plugin-react-hooks';
import reactRefresh from 'eslint-plugin-react-refresh';

import js from '@eslint/js';
import vitest from '@vitest/eslint-plugin';

import jsxA11y from 'eslint-plugin-jsx-a11y';
import { defineConfig } from 'eslint/config';
import globals from 'globals';
import tseslint from 'typescript-eslint';

export default defineConfig(
  { ignores: ['build', 'site', '.react-router', 'node_modules', 'design'] },
  // Every file, configs and the asset scripts included.
  js.configs.recommended,
  {
    files: ['**/*.{js,mjs}'],
    languageOptions: { globals: globals.node }
  },
  {
    files: ['**/*.{ts,tsx}'],
    extends: [tseslint.configs.strictTypeChecked, jsxA11y.flatConfigs.recommended],
    languageOptions: {
      parserOptions: { projectService: true, tsconfigRootDir: import.meta.dirname }
    },
    plugins: { 'react-hooks': reactHooks, 'react-refresh': reactRefresh },
    rules: {
      ...reactHooks.configs.recommended.rules,
      // React Router route modules export these next to their component.
      'react-refresh/only-export-components': [
        'warn',
        {
          allowExportNames: [
            'meta',
            'links',
            'headers',
            'loader',
            'clientLoader',
            'action',
            'clientAction',
            'handle',
            'shouldRevalidate',
            'ErrorBoundary',
            'HydrateFallback',
            'Layout'
          ]
        }
      ],
      '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_', varsIgnorePattern: '^_' }],
      // Stage coordinates are interpolated into styles all over (`${x}px`).
      '@typescript-eslint/restrict-template-expressions': ['error', { allowNumber: true }],
      // Style rules the code deliberately goes against: setters returned from arrow shorthands, and `!` on lookups
      // of ids the data is known to hold.
      '@typescript-eslint/no-confusing-void-expression': 'off',
      '@typescript-eslint/no-non-null-assertion': 'off',
      // Combat stats are focusable so the keyboard reaches their hints, as the pointer does.
      'jsx-a11y/no-noninteractive-tabindex': ['error', { tags: ['div'] }]
    }
  },
  {
    // Tests stub and spy on globals freely.
    files: ['**/*.test.{ts,tsx}'],
    extends: [vitest.configs.recommended],
    rules: { '@typescript-eslint/unbound-method': 'off' }
  }
);
