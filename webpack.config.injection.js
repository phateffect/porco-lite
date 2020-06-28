const path = require('path');
const webpack = require('webpack');

const config = {
  mode: process.env.NODE_ENV,
  context: path.resolve(__dirname, 'src/injection'),
  devServer: {
    contentBase: path.resolve(__dirname, 'dist'),
    compress: true,
    port: 9000,
    headers: {
      'Access-Control-Allow-Origin': '*',
    },
  },
  entry: {
    'porco-lite': './index.js',
  },
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: '[name].js',
  },
  resolve: {
    extensions: ['.js'],
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        loader: 'babel-loader',
        exclude: /node_modules/,
      },
    ],
  },
  plugins: [
    new webpack.DefinePlugin({
      global: 'window',
    }),
  ],
};

if (config.mode === 'production') {
  config.plugins = (config.plugins || []).concat([
    new webpack.DefinePlugin({
      'process.env': {
        NODE_ENV: '"production"',
      },
    }),
  ]);
}

module.exports = config;
