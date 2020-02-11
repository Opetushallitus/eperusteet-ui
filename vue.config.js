const webpack = require('webpack');
const path = require('path');
const TerserPlugin = require('terser-webpack-plugin');

const eperusteetService = process.env.EPERUSTEET_SERVICE || 'http://localhost:8080';
const eperusteetYlopsService = process.env.EPERUSTEET_YLOPS_SERVICE || 'http://localhost:8081';
const eperusteetAmosaaService = process.env.EPERUSTEET_AMOSAA_SERVICE || 'http://localhost:8082';

if (process.env.EPERUSTEET_SERVICE) {
  console.log('Using eperusteet-service proxy:', process.env.EPERUSTEET_SERVICE);
}
else {
  console.log('EPERUSTEET_SERVICE not defined. Using local eperusteet-service.');
}

if (process.env.EPERUSTEET_YLOPS_SERVICE) {
  console.log('Using eperusteet-ylops-service proxy:', process.env.EPERUSTEET_YLOPS_SERVICE);
}
else {
  console.log('EPERUSTEET_YLOPS_SERVICE not defined. Using local eperusteet-ylops-service.');
}

if (process.env.EPERUSTEET_AMOSAA_SERVICE) {
  console.log('Using eperusteet-amosaa-service proxy:', process.env.EPERUSTEET_AMOSAA_SERVICE);
}
else {
  console.log('EPERUSTEET_AMOSAA_SERVICE not defined. Using local eperusteet-amosaa-service.');
}

const proxy = {
  '/eperusteet-service': {
    target: eperusteetService,
    secure: !!eperusteetService,
    onProxyReq: function(proxyReq, req, res) {
      proxyReq.setHeader('Caller-Id', '1.2.246.562.10.00000000001.eperusteet');
    },
  },
  '/eperusteet-ylops-service': {
    target: eperusteetYlopsService,
    secure: !!eperusteetYlopsService,
    onProxyReq: function(proxyReq, req, res) {
      proxyReq.setHeader('Caller-Id', '1.2.246.562.10.00000000001.eperusteet-ylops');
    },
  },
  '/eperusteet-amosaa-service': {
    target: eperusteetAmosaaService,
    secure: !!eperusteetAmosaaService,
    onProxyReq: function(proxyReq, req, res) {
      proxyReq.setHeader('Caller-Id', '1.2.246.562.10.00000000001.eperusteet-amosaa');
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
    port: 9020,
    proxy
  },
}
