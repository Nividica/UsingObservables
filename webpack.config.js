const webpack = require('webpack');
const path = require('path');
const CopyPlugin = require('copy-webpack-plugin');

const srcDir = path.resolve(__dirname, 'src');
const distDir = path.resolve(__dirname, 'dist');
const mainPage = 'UsingObservables.html';

module.exports = {
  devtool: 'eval-source-map',
  entry: path.resolve(srcDir, 'UserSolutions.ts'),
  mode: "development",
  module: {
    rules: [
      {
        test: /\.(ts|tsx)?$/,
        exclude: /node_modules/,
        loader: 'ts-loader'
      }
    ]
  },
  optimization: {
    splitChunks: {
      cacheGroups: {
        default: false,
        // vendor chunk
        vendors: {
          name: 'vendor',
          // sync + async chunks
          chunks: 'all',
          // import file path containing node_modules
          test: /node_modules/,
          reuseExistingChunk: true
        }
      }
    },
    runtimeChunk: { name: 'vendor' }
  },
  output: {
    path: distDir,
    filename: '[name].js'
  },
  plugins: [
    new CopyPlugin([
      { from: path.resolve(srcDir, mainPage), to: path.resolve(distDir, mainPage) }
    ]),
  ],
  resolve: {
    extensions: [
      '.tsx',
      '.ts',
      '.js'
    ]
  }
}
