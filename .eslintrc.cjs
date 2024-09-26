// eslint-disable-next-line import/no-extraneous-dependencies
// const sharedLib = require('eslint-config-airbnb-typescript/lib/shared.js');

module.exports = {
  root: true,
  extends: ['@vcsuite/eslint-config/vue3-ts'],
  env: {
    node: true,
  },
  rules: {
    'no-restricted-syntax': 'off',
  },
  overrides: [
    {
      files: ['*.ts', '*.vue'],
      parserOptions: {
        project: ['./tsconfig.json', './tests/tsconfig.json'],
      },
      rules: {
        '@typescript-eslint/no-non-null-assertion': 'off',
      },
    },
  ],
  ignorePatterns: ['dist/', 'node_modules/'],
};
