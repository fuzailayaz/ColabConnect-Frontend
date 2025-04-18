module.exports = {
    root: true,
    env: {
      browser: true,
      es2021: true,
      node: true,
    },
    extends: [
      'eslint:recommended',
      'plugin:react/recommended',
      'plugin:@typescript-eslint/recommended',
      'plugin:prettier/recommended', // Integrates Prettier with ESLint
      'next/core-web-vitals', // Next.js-specific linting rules
    ],
    parser: '@typescript-eslint/parser',
    parserOptions: {
      ecmaVersion: 12,
      sourceType: 'module',
      ecmaFeatures: {
        jsx: true,
      },
    },
    plugins: ['react', '@typescript-eslint', 'prettier'],
    rules: {
      'no-unused-vars': 'warn', // Warn for unused JS vars
      '@typescript-eslint/no-unused-vars': ['warn', { argsIgnorePattern: '^_' }], // Warn & ignore _ prefixed args
      'react/react-in-jsx-scope': 'off', // Next.js doesn't require this
      'react/prop-types': 'off', // Using TypeScript instead of prop-types
      '@typescript-eslint/no-explicit-any': 'off', // Allow use of `any` for now
      'prettier/prettier': 'warn', // Prettier formatting warnings
      'react-hooks/rules-of-hooks': 'off', // Disabled react-hooks rules
      'react/no-unescaped-entities': 'off', // Allow unescaped characters
    },
    settings: {
      react: {
        version: 'detect',
      },
    },
  };
  