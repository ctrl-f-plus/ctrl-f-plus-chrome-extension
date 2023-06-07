/* eslint-disable @typescript-eslint/no-var-requires */
// webpack.common.js;

const path = require('path');
const CopyPlugin = require('copy-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');
const ESLintPlugin = require('eslint-webpack-plugin');

function getHtmlWebpackPlugins(chunks) {
  return chunks.map(
    (chunk) =>
      new HtmlWebpackPlugin({
        title: 'Cntrl-F',
        filename: `${chunk}.html`,
        chunks: [chunk],
      })
  );
}

module.exports = {
  entry: {
    // popup: path.resolve('src/popup/popup.tsx'),
    // options: path.resolve('src/options/options.tsx'),
    background: path.resolve('src/background/background.ts'),
    contentScript: path.resolve('src/contentScripts/contentScript.tsx'),
  },
  module: {
    rules: [
      // TYPESCRIPT LOADER
      {
        test: /\.tsx?$/,
        use: 'ts-loader',
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
      {
        test: /\.(jpg|jpeg|png|woff|woff2|eot|ttf|svg)$/,
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

    // CopyPlugin allows us to copy static files into our distribution folder
    new CopyPlugin({
      patterns: [
        {
          from: path.resolve('src/static'),
          to: path.resolve('dist'),
        },
      ],
    }),

    ...getHtmlWebpackPlugins(['popup', 'options']),
    new ESLintPlugin(),
  ],

  // OUTPUT
  output: {
    filename: '[name].js',
    path: path.resolve('dist'),
  },

  optimization: {
    splitChunks: {
      chunks(chunk) {
        return chunk.name !== 'contentScript';
      },
    },
  },
};
