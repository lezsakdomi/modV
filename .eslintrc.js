module.exports = {
  root: true,
  env: {
    node: true,
  },
  'extends': [
    'plugin:vue/essential',
    '@vue/airbnb',
  ],
  rules: {
    'no-console': process.env.NODE_ENV === 'production' ? 'error' : 'off',
    'no-debugger': process.env.NODE_ENV === 'production' ? 'error' : 'off',
    'no-param-reassign': ['error', { props: false }],
    'import/extensions': ['never'],
    'no-shadow': ['error', { allow: ['state'] }],
    'prefer-destructuring': 'off',
  },
  parserOptions: {
    parser: 'babel-eslint'
  },
};
