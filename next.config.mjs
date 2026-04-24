/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  basePath: '/musical-couscous',
  trailingSlash: true,
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
}

export default nextConfig
