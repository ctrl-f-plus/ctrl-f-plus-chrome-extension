/* eslint-disable @typescript-eslint/no-var-requires */
// webpack.common.js;

const webpack = require('webpack');
const path = require('path');
// const fileSystem = require('fs-extra');
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

module.exports = (env) => ({
  entry: {
    // options: path.resolve('src/options/options.tsx'),
    // background: path.resolve('src/background/index.ts'),
    background: path.join(__dirname, 'src', 'background', 'index.ts'),
    // contentScript: path.resolve('src/contentScripts/contentScript.tsx'),
    layover: path.join(
      __dirname,
      'src',
      'contentScripts',
      'layover',
      'index.tsx'
    ),
    contentStyles: path.join(
      __dirname,
      'src',
      'contentScripts',
      'contentStyles.ts'
    ),
    // layover: path.resolve('src/layover/index.tsx'),
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
        exclude: /\.shadow\.css$/,
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
        test: /\.shadow\.css$/,
        use: 'raw-loader',
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
          // from: path.resolve('src/static'),
          from: path.resolve('static'),
          // from: path.resolve('public/manifest.json'),
          // from: path.resolve('public'),
          to: path.resolve('dist'),
        },
        // {
        //   from: path.resolve('public/images'),
        //   to: path.resolve('dist/images'),
        // },
      ],
    }),

    ...getHtmlWebpackPlugins(['popup', 'options']),

    new ESLintPlugin(),

    new webpack.DefinePlugin({
      // 'process.env.NODE_ENV': JSON.stringify(env.NODE_ENV),
      'process.env.E2E_TESTING': JSON.stringify(env.E2E_TESTING || false),
    }),
  ],

  // OUTPUT
  output: {
    filename: '[name].js',
    path: path.resolve('dist'),
    clean: true,
  },

  optimization: {
    splitChunks: {
      chunks(chunk) {
        // return chunk.name !== 'contentScript';
        return chunk.name !== 'layover';
      },
    },
  },
});
