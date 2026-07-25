import path from 'node:path';
import { fileURLToPath } from 'node:url';

import antfu from '@antfu/eslint-config';
import { createTypeScriptImportResolver } from 'eslint-import-resolver-typescript';
import betterTailwindcss from 'eslint-plugin-better-tailwindcss';
import reactCompiler from 'eslint-plugin-react-compiler';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export default antfu(
  {
    // Enable React and TypeScript support
    react: true,
    typescript: true,

    // Disable JSON processing for translation files (handled by i18n-json plugin)
    jsonc: false,

    // Use ESLint Stylistic for formatting
    stylistic: {
      indent: 2,
      quotes: 'single',
      semi: true,
    },

    // Global ignores
    ignores: [
      'dist/*',
      'node_modules',
      '__tests__/',
      'coverage',
      '.expo',
      '.expo-shared',
      'android',
      'ios',
      '.vscode',
      'docs/',
      'cli/',
      'expo-env.d.ts',
      'uniwind-types.d.ts',
      'migration/*',
      'script/*',
    ],
  },

  // Custom rules
  {
    rules: {
      'max-params': ['error', 3],
      'max-lines-per-function': ['error', 110],
      'react/display-name': 'off',
      'react/no-inline-styles': 'off',
      'react/destructuring-assignment': 'off',
      'react/require-default-props': 'off',
      'react-refresh/only-export-components': ['warn', { extraHOCs: ['ObserveRoot.wrap'] }],
      'unicorn/filename-case': [
        'error',
        {
          case: 'kebabCase',
          ignore: [
            '/android',
            '/ios',
            'README.md',
            'AGENTS.md',
          ],
        },
      ],
      'node/prefer-global/process': 'off', // process is commonly used in React Native configs
      'ts/no-require-imports': 'off', // Sometimes needed for mocks
      'ts/no-use-before-define': 'off', // Allow forward references in React components
      'no-console': 'off', // Console is useful for debugging
      'no-cond-assign': 'off', // Allow assignment in conditions when intentional
      'regexp/no-super-linear-backtracking': 'off', // Relax regex performance rules
      'regexp/no-unused-capturing-group': 'off', // Allow unused capturing groups
    },
  },

  // TypeScript-specific rules
  {
    files: ['**/*.ts', '**/*.tsx'],
    rules: {
      'ts/consistent-type-definitions': ['error', 'type'], // Prefer type over interface
      'react-hooks/refs': 'off', // Allow useRef without exhaustive-deps
      'ts/consistent-type-imports': [
        'warn',
        {
          prefer: 'type-imports',
          fixStyle: 'inline-type-imports',
          disallowTypeAnnotations: true,
        },
      ],
    },
  },

  // Disable type-aware rules for JS files (they use a different parser)
  {
    files: ['**/*.js', '**/*.mjs', '**/*.cjs'],
    rules: {
      'ts/consistent-type-imports': 'off',
    },
  },

  // Better TailwindCSS plugin
  {
    files: ['src/**/*.{js,jsx,ts,tsx}', 'app/**/*.{js,jsx,ts,tsx}'],
    ...betterTailwindcss.configs.recommended,
    settings: {
      'better-tailwindcss': {
        entryPoint: path.resolve(__dirname, './global.css'),
      },
      'import-x/resolver-next': [
        createTypeScriptImportResolver({
          alwaysTryTypes: true, // Always try to resolve types under `<root>@types` directory even if it doesn't contain any source code, like `@types/unist`

          bun: true, // Resolve Bun modules (https://github.com/import-js/eslint-import-resolver-typescript#bun)

          // Choose from one of the "project" configs below or omit to use <root>/tsconfig.json or <root>/jsconfig.json by default

          // Use <root>/path/to/folder/tsconfig.json or <root>/path/to/folder/jsconfig.json
          project: './tsconfig.json',

        }),
      ],
    },
    rules: {
      ...betterTailwindcss.configs.recommended.rules,
      'better-tailwindcss/no-unnecessary-whitespace': 'warn',
      'better-tailwindcss/no-unknown-classes': ['warn', {
        ignore: [
          // Uniwind semantic theme tokens (dynamically resolved at runtime)
          '^((focus|group-active|active|dark:focus|dark:active):)?(bg|text)-(popover|popover-foreground|accent-foreground|foreground|card|card-foreground|muted-foreground|primary|primary-foreground|destructive|destructive-foreground|muted|secondary|border|accent|accent-foreground|ring)(/\\d+)?$',
          '^border-(border|primary|destructive|ring|muted-foreground)(/\\d+)?$',
          '^ring-primary$',
        ],
      }],
      'better-tailwindcss/enforce-consistent-line-wrapping': 'off', // Can be too strict for some cases
    },
  },

  // React Compiler plugin
  {
    plugins: {
      'react-compiler': reactCompiler,
    },
    rules: {
      'react-compiler/react-compiler': 'error',
    },
  },
);
