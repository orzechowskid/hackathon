/* eslint-env commonjs */
module.exports = {
  env: {
    'es2020': true,
    'node': true
  },
  extends: [
    `eslint:recommended`,
    `plugin:@typescript-eslint/recommended`,
    `plugin:eslint-plugin-eslint-comments/recommended`,
    `prettier`
  ],
  parser: `@typescript-eslint/parser`,
  plugins: [
    `@typescript-eslint`
  ],
  root: true,
  rules: {
    'quotes': [ `error`, `backtick` ],

    /* handled by tsc */
    '@typescript-eslint/no-unused-vars': [ `off` ],
    /* we're cjs, not esm */
    '@typescript-eslint/no-var-requires': [ `off` ],

    'eslint-comments/disable-enable-pair': [ `error` ],
    'eslint-comments/require-description': [ `error`, {
      'ignore': [
        `eslint-env`
      ]
    }]
  }
};
