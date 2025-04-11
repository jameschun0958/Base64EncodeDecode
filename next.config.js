/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  // For GitHub Pages deployment
  basePath: process.env.NODE_ENV === 'production' ? '/Base64EncodeDecode' : '',
  assetPrefix: process.env.NODE_ENV === 'production' ? '/Base64EncodeDecode/' : '',
  
  // For local development, temporarily modifiable when testing
  // basePath: '',
  // assetPrefix: './',
  
  images: {
    unoptimized: true,
  },
  trailingSlash: true,
  distDir: 'build',
};

module.exports = nextConfig;