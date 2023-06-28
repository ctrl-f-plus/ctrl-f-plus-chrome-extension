/* eslint-disable @typescript-eslint/no-var-requires */
// webpack.common.js;

const webpack = require('webpack');
const path = require('path');
// const fileSystem = require('fs-extra');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');
const ESLintPlugin = require('eslint-webpack-plugin');

function getHtmlWebpackPlugins(chunks) {
  return chunks.map(
    (chunk) =>
      new HtmlWebpackPlugin({
        title: 'Ctrl-F',
        filename: `${chunk}.html`,
        chunks: [chunk],
      })
  );
}

module.exports = (env) => ({
  entry: {
    // options: path.resolve('src/options/options.tsx'),
    background: path.join(__dirname, 'src/background/index.ts'),
    layover: path.join(__dirname, 'src/contentScripts/layover/index.tsx'),
    contentStyles: path.join(__dirname, 'src/contentScripts/contentStyles.ts'),
  },
  module: {
    rules: [
      // BABEL & TYPESCRIPT LOADER
      {
        test: /\.(t|j)sx?$/,
        use: 'babel-loader',
        exclude: /(?:node_modules|\.tmp)/,
      },

      // CSS/STYLE LOADER
      {
        test: /\.css$/i,
        use: [
          'style-loader',
          {
            loader: 'css-loader',
            options: {
              importLoaders: 1,
            },
          },
          'postcss-loader',
        ],
      },

      // Resource Loader (included in webpack)
      {
        test: /\.(jpg|jpeg|png|woff|woff2|eot|ttf|svg|gif)$/,
        type: 'asset/resource',
      },
    ],
  },

  // APPLIES THE MODULES TO THESE TYPES OF FILES
  resolve: {
    extensions: ['.tsx', '.ts', '.js'],
  },

  plugins: [
    new CleanWebpackPlugin({
      cleanStaleWebpackAssets: false,
    }),

    ...getHtmlWebpackPlugins(['options']),

    new ESLintPlugin(),

    new webpack.DefinePlugin({
      'process.env.E2E_TESTING': JSON.stringify(env.E2E_TESTING || false),
    }),
  ],

  // OUTPUT
  output: {
    filename: '[name].js',
    path: path.resolve('dist/build'),
    clean: true,
  },

  optimization: {
    splitChunks: {
      chunks(chunk) {
        return chunk.name !== 'layover';
      },
    },
  },
});
