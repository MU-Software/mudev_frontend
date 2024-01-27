module.exports = {
  root: true,
  env: { browser: true, es2020: true },
  extends: [
    'eslint:recommended',
    'plugin:import/recommended',
    'plugin:import/typescript',
    'plugin:@cspell/recommended',
    'plugin:@typescript-eslint/recommended',
    'plugin:react/recommended',
    'plugin:react-hooks/recommended',
    'plugin:prettier/recommended',
  ],
  ignorePatterns: ['dist', '.eslintrc.cjs'],
  parser: '@typescript-eslint/parser',
  plugins: ['react-refresh'],
  // settings: {
  //   'import/resolver': {
  //     typescript: {},
  //   },
  //   react: {
  //     version: 'detect',
  //   },
  // },
  rules: {
    '@cspell/spellchecker': [
      'warn',
      {
        cspell: {
          words: ['packlint', 'codecov', 'tsup', 'apng', 'topbar', 'sidebar', 'signup'],
        },
      },
    ],
    'react-refresh/only-export-components': ['warn', { allowConstantExport: true }],
    'react/react-in-jsx-scope': 'off',
    'react/prop-types': 'off',
    // 'sort-imports': ['error', { ignoreDeclarationSort: true }],
    // 'import/no-duplicates': ['error', { 'prefer-inline': true }],
    // 'import/order': [
    //   'error',
    //   {
    //     'newlines-between': 'never',
    //     alphabetize: { order: 'asc', caseInsensitive: true },
    //   },
    // ],
  },
}
