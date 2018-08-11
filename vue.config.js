const path = require('path');
const MediaManager = require('modv-media-manager');

// const mm = new MediaManager(3132); //eslint-disable-line

module.exports = {
  configureWebpack: {
    output: {
      globalObject: 'this',
    },
    resolve: {
      alias: {
        modv: path.resolve(__dirname, 'src/modv/'),
        meyda: 'meyda/src/main.js',
      },
    },

    module: {
      rules: [
        {
          test: /\.(glsl|vert|frag|fs|vs)$/,
          loader: 'text-loader',
        },
      ],
    },
  },
  runtimeCompiler: true,
  productionSourceMap: false,
};
