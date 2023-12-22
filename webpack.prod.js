const { merge } = require('webpack-merge');
const common = require('./webpack.common.js');
module.exports = merge(common, {
  mode: 'production',
  output: {
    path: "C:/Program Files/Pengu Loader/plugins/batch-delete-friends",
    filename: 'index.js',
  },
});
