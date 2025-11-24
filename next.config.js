/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'firebasestorage.googleapis.com',
        // HE QUITADO "pathname" y "port" para que acepte TODO lo que venga de Firebase
      },
    ],
  },
}

module.exports = nextConfig
