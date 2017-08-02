module.exports = {
  plugins: [
    'chai-expect',
    'mocha'
  ],
  extends: [
    '@condenast/eslint-config-condenast',
    '@condenast/eslint-config-condenast/rules/ext/chai-expect',
    '@condenast/eslint-config-condenast/rules/ext/mocha'
  ],
  parserOptions: {
    'sourceType': 'script'
  },
  ecmaFeatures: {
    'modules': false
  },
  rules: {
    "space-before-function-paren": ["error", "never"],
    "no-use-before-define": ["error", { functions: false, classes: true, variables: true }],
    "jsdoc/check-param-names": 0,
    "strict": ["error", "safe"],
    "no-confusing-arrow": 0
  }
}
