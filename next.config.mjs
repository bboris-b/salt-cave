/** @type {import('next').NextConfig} */
const nextConfig = {
  async redirects() {
    return [{ source: '/contenuto', destination: '/', permanent: true }]
  },
}

export default nextConfig
