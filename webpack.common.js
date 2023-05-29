// webpack.common.js;

const path = require('path');
const CopyPlugin = require('copy-webpack-plugin');
const HtmlPlugin = require('html-webpack-plugin');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');
const ESLintPlugin = require('eslint-webpack-plugin');

const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const tailwindcss = require('tailwindcss');
const autoprefixer = require('autoprefixer');

function getHtmlPlugins(chunks) {
  return chunks.map(
    (chunk) =>
      new HtmlPlugin({
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
      {
        test: /\.tsx?$/,
        use: 'ts-loader',
        exclude: /(?:node_modules|\.tmp)/,
      },
      // {
      //   test: /\.css$/i,
      //   use: [
      //     'style-loader',
      //     {
      //       loader: 'css-loader',
      //       options: {
      //         importLoaders: 1,
      //       },
      //     },
      //     // 'postcss-loader',
      //     {
      //       loader: MiniCssExtractPlugin.loader,
      //       options: {
      //         // you can specify a publicPath here
      //         // by default it uses publicPath in webpackOptions.output
      //         publicPath: '../',
      //       },
      //     },
      //     'css-loader',
      //     {
      //       loader: 'postcss-loader',
      //       options: {
      //         postcssOptions: {
      //           plugins: [tailwindcss, autoprefixer],
      //         },
      //       },
      //     },
      //   ],
      // },
      {
        test: /\.css$/i,
        use: [
          MiniCssExtractPlugin.loader, // Changed
          {
            loader: 'css-loader',
            options: {
              importLoaders: 1,
            },
          },
          {
            loader: 'postcss-loader',
            options: {
              postcssOptions: {
                plugins: [tailwindcss, autoprefixer],
              },
            },
          },
        ],
      },
      {
        test: /\.(jpg|jpeg|png|woff|woff2|eot|ttf|svg)$/,
        type: 'asset/resource',
      },
    ],
  },
  resolve: {
    extensions: ['.tsx', '.ts', '.js'],
  },
  plugins: [
    new CleanWebpackPlugin({
      cleanStaleWebpackAssets: false,
    }),
    new CopyPlugin({
      patterns: [
        {
          from: path.resolve('src/static'),
          to: path.resolve('dist'),
        },
      ],
    }),
    ...getHtmlPlugins(['popup', 'options']),
    new ESLintPlugin(),
    new MiniCssExtractPlugin({
      filename: '[name].css',
      chunkFilename: '[id].css',
    }),
  ],
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
