const defaultConfig = require('@wordpress/scripts/config/webpack.config');

module.exports = {
  ...defaultConfig,

  entry: {
    blocks: './src/blocks.ts',
    sidebar: './src/sidebar.ts',
  },
};
