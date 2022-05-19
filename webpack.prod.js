const path = require('path');
const { merge } = require('webpack-merge');
const CopyPlugin = require('copy-webpack-plugin');
const common = require('./webpack.common.js');

module.exports = merge(common, {
  mode: 'production',
  plugins: [
    new CopyPlugin({
      patterns: [
        {
          from: path.resolve(__dirname, './public/images'),
          to: path.resolve(__dirname, './dist/images'),
        },
        '.nojekyll',
        './public/googleb5e9d5daa6e90193.html'
      ],
    }),
  ],
});
