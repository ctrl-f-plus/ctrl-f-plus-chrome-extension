const { merge } = require('webpack-merge');
const common = require('./webpack.common.js');

module.exports = merge(common, {
  mode: 'production',
  optimization: {
    moduleIds: 'deterministic',
    chunkIds: 'deterministic',
    // runtimeChunk: 'single',
  },
});
