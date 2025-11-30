const CracoAlias = require('craco-alias');
const webpack = require('webpack');
const packageJson = require('./package.json');

module.exports = {
  webpack: {
    plugins: {
      add: [
        new webpack.DefinePlugin({
          'process.env.REACT_APP_VERSION': JSON.stringify(packageJson.version),
        }),
      ],
    },
  },
  style: {
    sass: {
      loaderOptions: (sassLoaderOptions) => ({
        ...sassLoaderOptions,
        api: 'modern',
      }),
    },
  },
  plugins: [
    {
      plugin: CracoAlias,
      options: {
        source: 'jsconfig',
        jsConfigPath: 'jsconfig.json',
      },
    },
  ],
};