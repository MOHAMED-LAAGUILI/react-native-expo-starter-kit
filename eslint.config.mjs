import path from 'node:path';
import { fileURLToPath } from 'node:url';

import antfu from '@antfu/eslint-config';
import betterTailwindcss from 'eslint-plugin-better-tailwindcss';
import reactCompiler from 'eslint-plugin-react-compiler';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const config = antfu(
  {
    react: true,
    typescript: true,

    jsonc: false,

    stylistic: {
      indent: 2,
      quotes: 'single',
      semi: true,
    },

    ignores: [
      'dist',
      'node_modules/',
      '__tests__/',
      'coverage/',
      '.expo/',
      '.expo-shared/',
      'android/',
      'ios/',
      '.vscode/',
      'docs/',
      'cli/',
      '**/*.md',
      'expo-env.d.ts',
      'uniwind-types.d.ts',
      'migration/',
      'script/',
      '.metro-cache/',
    ],
  },
).then(result => [
  ...result,
  {
    name: 'custom-rules',
    files: ['**/*.{ts,tsx,js,jsx,mjs,cjs}'],
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
            'AGENTS.md',
            'ABOUT.md',
            'DESIGN.md',
            'CODE_OF_CONDUCT.md',
            'CONTRIBUTING.md',
            'CHANGELOG.md',
            'LICENSE.md',
            'README.md',
            'SECURITY.md',
          ],
        },
      ],
      'node/prefer-global/process': 'off',
      'ts/no-require-imports': 'off',
      'ts/no-use-before-define': 'off',
      'no-console': 'off',
      'no-cond-assign': 'off',
      'regexp/no-super-linear-backtracking': 'off',
      'regexp/no-unused-capturing-group': 'off',
    },
  },
  {
    name: 'typescript-rules',
    files: ['**/*.ts', '**/*.tsx'],
    rules: {
      'ts/consistent-type-definitions': ['error', 'type'],
      'react-hooks/refs': 'off',
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
  {
    name: 'javascript-overrides',
    files: ['**/*.js', '**/*.mjs', '**/*.cjs'],
    rules: {
      'ts/consistent-type-imports': 'off',
    },
  },
  {
    name: 'tailwindcss',
    files: ['src/**/*.{js,jsx,ts,tsx}', 'app/**/*.{js,jsx,ts,tsx}'],
    ...betterTailwindcss.configs.recommended,
    settings: {
      'better-tailwindcss': {
        entryPoint: path.resolve(__dirname, './global.css'),
      },
    },
    rules: {
      ...betterTailwindcss.configs.recommended.rules,
      'better-tailwindcss/no-unnecessary-whitespace': 'warn',
      'better-tailwindcss/no-unknown-classes': ['warn', {
        ignore: [
          '^((focus|group-active|active|dark|dark:focus|dark:active):)?(bg|text)-(popover|popover-foreground|accent-foreground|foreground|card|card-foreground|muted-foreground|primary|primary-foreground|destructive|destructive-foreground|muted|secondary|border|accent|accent-foreground|ring|input)(/\\d+)?$',
          '^((focus|group-active|active|dark|dark:focus|dark:active):)?border-(border|input|foreground|primary|destructive|ring|muted-foreground)(/\\d+)?$',
          '^ring-primary$',
        ],
      }],
      'better-tailwindcss/enforce-consistent-line-wrapping': 'off',
    },
  },
  {
    name: 'react-compiler',
    plugins: {
      'react-compiler': reactCompiler,
    },
    rules: {
      'react-compiler/react-compiler': 'error',
    },
  },
]);

export default config;
