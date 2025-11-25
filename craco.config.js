const CracoAlias = require('craco-alias');

module.exports = {
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