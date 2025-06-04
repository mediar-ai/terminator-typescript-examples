/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    serverComponentsExternalPackages: ['ollama-ai-provider']
  }
}

module.exports = nextConfig 