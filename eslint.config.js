import { FlatCompat } from '@eslint/eslintrc';
import js from '@eslint/js';
import perfectionist from 'eslint-plugin-perfectionist';
import playwright from 'eslint-plugin-playwright';
import reactHooks from 'eslint-plugin-react-hooks';
import { defineConfig, globalIgnores } from 'eslint/config';
import globals from 'globals';
import tseslint from 'typescript-eslint';

const compat = new FlatCompat({
  baseDirectory: import.meta.dirname,
});

const testingLibrary = (await import('eslint-plugin-testing-library')).default;

export default defineConfig([
  globalIgnores([
    '.github',
    '.next',
    '.netlify',
    '.swc',
    'coverage',
    'build',
    'data',
    'data-archive',
    'dist',
    'node_modules',
    'originals',
    'out',
    'public',
    'supabase/database.types.ts',
    'next-env.d.ts',
    'vt-chrome-extension',
    'playwright-report',
  ]),
  js.configs.recommended,
  ...tseslint.configs.recommended,
  ...compat.extends('next/core-web-vitals'),
  {
    files: ['src/**/*.test.{ts,tsx}'],
    plugins: {
      'testing-library': testingLibrary,
    },
    rules: {
      ...testingLibrary.configs['flat/react'].rules,
      'testing-library/no-debugging-utils': 'error',
      // Selectively enforce stricter rules aligned with our Testing Best Practices
      'testing-library/no-node-access': [
        'error',
        {
          allowContainerFirstChild: true,
        },
      ],
      'testing-library/prefer-explicit-assert': 'error',
      'testing-library/prefer-user-event': 'error',
    },
  },
  // Narrow override for hook-only tests (renderHook with no DOM).
  // The testing-library/no-node-access rule can misfire on data objects using
  // properties like `children` that are not DOM nodes. Disable it only here.
  {
    files: ['src/**/use*.test.{ts,tsx}'],
    plugins: {
      'testing-library': testingLibrary,
    },
    rules: {
      'testing-library/no-node-access': 'off',
    },
  },
  {
    files: ['**/*.{ts,tsx}'],
    ignores: ['**/*.config.{ts,js}', '**/*.cjs'],
    languageOptions: {
      ecmaVersion: 2020,
      globals: globals.browser,
      parserOptions: {
        project: true,
        tsconfigRootDir: import.meta.dirname,
      },
    },
    plugins: {
      perfectionist,
      'react-hooks': reactHooks,
    },
    rules: {
      'react-hooks/gating': 'error',
      'react-hooks/immutability': 'error',
      'react-hooks/preserve-manual-memoization': 'error',
      'react-hooks/purity': 'off',
      'react-hooks/refs': 'error',
      // Some strict new rules from react-hooks v7 are enabled (gating, immutability, preserve-manual-memoization, refs, set-state-in-render), others are temporarily disabled (set-state-in-effect, static-components, purity)
      'react-hooks/set-state-in-effect': 'off',
      'react-hooks/set-state-in-render': 'error',
      'react-hooks/static-components': 'off',
      ...Object.fromEntries(
        Object.entries(perfectionist.configs['recommended-natural']?.rules ?? {}).map(
          ([rule, config]) => {
            // Set these to always warnings instead of errors so that AI tools do not get confused
            if (Array.isArray(config)) {
              return [rule, ['warn', ...config.slice(1)]];
            }
            if (typeof config === 'string') {
              return [rule, 'warn'];
            }
            return [rule, config];
          }
        )
      ),
      '@typescript-eslint/no-floating-promises': 'error',
      '@typescript-eslint/no-unused-expressions': [
        'error',
        {
          allowShortCircuit: true,
          allowTaggedTemplates: true,
          allowTernary: true,
        },
      ],
      '@typescript-eslint/no-unused-vars': [
        'error',
        {
          argsIgnorePattern: '^_',
          caughtErrorsIgnorePattern: '^_',
          varsIgnorePattern: '^_',
        },
      ],
      quotes: ['error', 'single', { avoidEscape: true }],
    },
  },
  {
    files: ['**/*.{js,jsx}'],
    languageOptions: {
      ecmaVersion: 2020,
      globals: globals.browser,
    },
    plugins: {
      perfectionist,
      'react-hooks': reactHooks,
    },
    rules: {
      'react-hooks/gating': 'error',
      'react-hooks/immutability': 'error',
      'react-hooks/preserve-manual-memoization': 'error',
      'react-hooks/purity': 'off',
      'react-hooks/refs': 'error',
      'react-hooks/set-state-in-effect': 'off',
      'react-hooks/set-state-in-render': 'error',
      'react-hooks/static-components': 'off',
      ...Object.fromEntries(
        Object.entries(perfectionist.configs['recommended-natural']?.rules ?? {}).map(
          ([rule, config]) => {
            if (Array.isArray(config)) {
              return [rule, ['warn', ...config.slice(1)]];
            }
            if (typeof config === 'string') {
              return [rule, 'warn'];
            }
            return [rule, config];
          }
        )
      ),
      '@typescript-eslint/no-unused-expressions': [
        'error',
        {
          allowShortCircuit: true,
          allowTaggedTemplates: true,
          allowTernary: true,
        },
      ],
      '@typescript-eslint/no-unused-vars': [
        'error',
        {
          argsIgnorePattern: '^_',
          caughtErrorsIgnorePattern: '^_',
          varsIgnorePattern: '^_',
        },
      ],
      quotes: ['error', 'single', { avoidEscape: true }],
    },
  },
  // Scope Node globals to server-side and build files
  {
    files: [
      'src/app/api/**/*.{ts,tsx}',
      'src/middleware.ts',
      'src/lib/server/**/*.ts',
      'lib/server/**/*.ts',
      'scripts/**/*.{ts,js}',
      'instrumentation.ts',
      '*.config.{js,ts}',
      '*.cjs',
    ],
    languageOptions: {
      globals: { ...globals.browser, ...globals.node },
    },
  },
  // Playwright test configuration with recommended rules
  {
    files: ['tests/**/*.{ts,tsx}'],
    languageOptions: {
      parserOptions: {
        project: true,
        tsconfigRootDir: import.meta.dirname,
      },
    },
    plugins: {
      playwright,
    },
    rules: {
      ...playwright.configs.recommended.rules,
      '@typescript-eslint/no-floating-promises': 'error',
      'playwright/no-skipped-test': 'off',
      'react-hooks/rules-of-hooks': 'off',
    },
  },
  // E2E test specific rules - relax some Playwright rules for common patterns
  // These patterns are necessary for handling auth state and dynamic content
  {
    files: ['tests/e2e/**/*.{ts,tsx}'],
    rules: {
      'playwright/no-conditional-expect': 'off',
      // Conditionals are necessary for handling auth state in E2E tests
      'playwright/no-conditional-in-test': 'off',
      // waitForSelector is sometimes needed for third-party iframes (Braintree)
      'playwright/no-wait-for-selector': 'off',
      // waitForTimeout may be needed for third-party integrations
      'playwright/no-wait-for-timeout': 'off',
    },
  },
]);
