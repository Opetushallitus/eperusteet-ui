const webpack = require('webpack');
const path = require('path');

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
  publicPath: process.env.NODE_ENV === 'production' ? '/eperusteet-service/ui' : '/',
  configureWebpack: {
    resolve: {
      alias: {
        'vue$': 'vue/dist/vue.esm.js',
        '@shared': path.resolve(__dirname, 'eperusteet-frontend-utils/vue/src'),
        '@assets': path.resolve(__dirname, 'eperusteet-frontend-utils/vue/public'),
        '@public': path.resolve(__dirname, 'public'),
      },
    },
    plugins: [
      new webpack.IgnorePlugin({
        resourceRegExp: /^\.\/locale$/,
        contextRegExp: /moment$/,
      }),
    ],
  },

  chainWebpack: config => {
    // enabloidaan sourcemap ja nimetään "oikeat" vuen scirpti-tiedostot uudelleen, jotta löytyy selaimen devtoolsissa helpommin
    // esim. RouteRoot.vue?bf9d -> RouteRoot.vue?script
    if (process.env.USE_SOURCEMAP) {
      config.devtool('source-map');
      config.output.devtoolModuleFilenameTemplate(info => {
        if (info.resourcePath.endsWith('.vue')) {
          if (info.query.startsWith('?vue&type=script') && !info.allLoaders.includes('babel')) {
            return `src://${info.resourcePath}?script`;
          }
        }
      });
    }
  },
  devServer: {
    client: {
      logging: 'none',
      overlay: true,
      progress: true,
    },
    port: 9001,
    proxy,
  },
  transpileDependencies: [
    /[\\/]node_modules[\\/]tiptap.*/,
  ],
  pwa: {
    iconPaths: {
      faviconSVG: null,
      favicon32: null,
      favicon16: null,
      appleTouchIcon: null,
      maskIcon: null,
      msTileImage: null,
    },
  },
};
