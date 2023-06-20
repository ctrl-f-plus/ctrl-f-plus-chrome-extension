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
        title: 'Ctrl-F',
        filename: `${chunk}.html`,
        chunks: [chunk],
      })
  );
}

module.exports = {
  entry: {
    popup: path.resolve('src/popup/popup.tsx'),
    // options: path.resolve('src/options/options.tsx'),
    background: path.resolve('src/background/background.ts'),

    contentScript: path.resolve('src/contentScripts/contentScript.tsx'),
    contentScriptDeclarative: path.resolve(
      'src/contentScripts/contentScriptDeclarative.tsx'
    ),

    // App: path.resolve('src/contentScripts/App.tsx'),
    // // contentScriptIndex: path.resolve('src/contentScripts/index.tsx'),
    // indexEntry: path.resolve('src/contentScripts/indexEntry.tsx'),
    // Providers: path.resolve('src/contentScripts/Providers.tsx'),
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
    clean: true,
  },

  // optimization: {
  //   splitChunks: {
  //     chunks(chunk) {
  //       return chunk.name !== 'contentScript';
  //       // return (
  //       //   // chunk.name !== 'contentScript'
  //       //   // &&
  //       //   chunk.name !== 'App' &&
  //       //   chunk.name !== 'index' &&
  //       //   chunk.name !== 'Providers'
  //       // );
  //     },
  //   },
  // },
};
