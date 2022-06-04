/* config-overrides.js */
const { override, useBabelRc, addBabelPlugins, addWebpackAlias, addWebpackResolve, } = require('customize-cra');
const path = require('path');

module.exports = override(
  // addWebpackAlias({
  //   ['@src']: path.resolve(__dirname, 'src'),
  //   ['@ui']: path.resolve(__dirname, 'src/ui'),
  // }),
  addWebpackResolve({ extensions: ['.js', '.jsx', '.ts', '.tsx'], }),
  useBabelRc(),
  addBabelPlugins(
    [
      "@babel/plugin-proposal-class-properties",
      { loose: true, },
    ]
  ),
  addBabelPlugins(
    [
      "@babel/plugin-proposal-private-methods",
      { loose: true, },
    ]
  ),
  addBabelPlugins(
    [
      "@babel/plugin-syntax-class-properties",
      { loose: true, },
    ]
  ),
);
