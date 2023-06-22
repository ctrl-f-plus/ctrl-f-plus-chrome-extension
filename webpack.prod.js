// webpack.prod.js;

const { merge } = require('webpack-merge');
const common = require('./webpack.common.js');

module.exports = (env) => {
  return merge(common(env), {
    mode: 'production',
    optimization: {
      moduleIds: 'deterministic',
      chunkIds: 'deterministic',
    },
  });
};
