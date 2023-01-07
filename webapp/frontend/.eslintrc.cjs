/* eslint-env commonjs */
module.exports = {
  env: {
    'browser': true,
    'es2020': true
  },
  extends: [
    `eslint:recommended`,
    `plugin:@typescript-eslint/recommended`,
    `plugin:eslint-plugin-eslint-comments/recommended`,
    `plugin:react-hooks/recommended`,
    `prettier`
  ],
  parser: `@typescript-eslint/parser`,
  plugins: [
    `@typescript-eslint`,
    `react`
  ],
  root: true,
  rules: {
    'quotes': [ `error`, `backtick` ],

    /* handled by tsc */
    '@typescript-eslint/no-unused-vars': [ `off` ],

    'eslint-comments/disable-enable-pair': [ `error` ],
    'eslint-comments/require-description': [ `error`, {
      'ignore': [
        `eslint-env`
      ]
    }],

    'react/button-has-type': [ `error` ]
  }
};
