/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'firebasestorage.googleapis.com',
        // Esto le dice a Next.js: "Solo optimiza fotos de MI bucket de boda", 
        // evitando errores de seguridad.
        pathname: '/v0/b/boda-74934.firebasestorage.app/o/**',
      },
    ],
  },
}

module.exports = nextConfig
