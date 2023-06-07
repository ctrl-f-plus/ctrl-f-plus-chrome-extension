// webpack.config.js;
// USING COMMON JS SYNTAX

const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const BundleAnalyzerPlugin =
  require('webpack-bundle-analyzer').BundleAnalyzerPlugin;

module.exports = {
  mode: 'development',

  // ENTRY PointerEvent(s)
  entry: {
    bundle: path.resolve(__dirname, 'src/index.js'),
  },

  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: '[name].[contenthash].js',
    clean: true,
    assetModuleFilename: '[name][ext]',
  },

  // SOURCE MAPPINGS:
  devtool: 'source-map',

  // DEV SERVER
  devServer: {
    static: {
      directory: path.resolve(__dirname, 'dist'),
    },
    port: 3000,
    // open: true,
    hot: true,
    compress: true,
    historyApiFallback: true,
  },

  // LOADERS
  module: {
    rules: [
      // CSS Loaders
      {
        test: /\.scss$/,
        use: ['style-loader', 'css-loader', 'sass-loader'],
      },

      // Babel Loader - enables backwards compatability
      {
        test: /\.js$/,
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader',
          options: {
            presets: ['@babel/preset-env'],
          },
        },
      },

      // Resource Loader (included in webpack)
      {
        test: /\.(png|svg|jpg|jpeg|gif)$/i,
        type: 'asset/resource',
      },
    ],
  },

  // PLUGINS
  plugins: [
    new HtmlWebpackPlugin({
      title: 'Webpack App',
      filename: 'index.html',
      template: 'src/template.html',
    }),

    // Bundle Analyzer Plugin
    new BundleAnalyzerPlugin(),
  ],
};
