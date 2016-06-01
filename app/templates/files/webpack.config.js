/* global __dirname */
var path = require('path');

module.exports = {
  entry: ['./src/module.js'],
  output: {
    libraryTarget: 'var',
    library: '<%= componentCamelName %>',
  },
  externals: {
    angular: 'angular',
  },
  module: {
    loaders: [
      {
        test: /\.js?$/,
        include: [path.join(__dirname, 'src')],
        loader: 'babel',
      },
    ],
  },
};
