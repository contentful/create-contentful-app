module.exports = {
  extends: ['eslint:recommended', 'plugin:node/recommended', 'prettier'],
  env: {
    node: true,
    mocha: true
  },
  rules: {
    "node/no-extraneous-require": [
      "error", {
        // DevDeps are hoisted by lerna
        "allowModules": Object.keys(require('./package.json').devDependencies)
      }
    ]
  }
};
