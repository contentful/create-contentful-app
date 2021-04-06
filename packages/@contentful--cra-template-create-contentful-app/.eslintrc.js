module.exports = {
  root: true,
  parser: '@typescript-eslint/parser',
  plugins: [
    '@typescript-eslint',
  ],
  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended',
    'prettier'
  ],
  // This allows us to provide some examples with 
  // half-done bits of code
  rules: {
    "@typescript-eslint/no-explicit-any": [0],
    "@typescript-eslint/explicit-module-boundary-types": [0],
    "@typescript-eslint/no-unused-vars": [0],
    "@typescript-eslint/no-empty-interface": [0]
  }
};