const nextConfig = {
  output: 'export',
  basePath: process.env.NODE_ENV === 'production' ? '/Base64EncodeDecode' : '',
  assetPrefix: process.env.NODE_ENV === 'production' ? './' : '',
};

module.exports = nextConfig;