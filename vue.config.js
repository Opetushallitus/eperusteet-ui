const webpack = require('webpack');
const path = require('path');
const TerserPlugin = require('terser-webpack-plugin');

const proxy = {
  '/eperusteet-service': {
    target: 'http://localhost:8080',
    secure: false,
    onProxyReq: function(proxyReq, req, res) {
      proxyReq.setHeader('Caller-Id', '1.2.246.562.10.00000000001.eperusteet');
    },
  },
};

module.exports = {
  lintOnSave: false,
  configureWebpack: {
    resolve: {
      alias: {
        'vue$': path.resolve(__dirname, 'node_modules/vue'),
        '@shared': path.resolve(__dirname, 'eperusteet-frontend-utils/vue/src'),
        '@public': path.resolve(__dirname, 'public'),
      },
    },
    plugins: [
      new webpack.IgnorePlugin(/^\.\/locale$/, /moment$/),
    ],
  },
  devServer: {
    overlay: {
      warnings: false,
      errors: true,
    },
    clientLogLevel: 'none',
    port: 9001,
    proxy,
  },
};
