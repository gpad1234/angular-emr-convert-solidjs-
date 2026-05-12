/** @type {import('next').NextConfig} */

/**
 * next.config.js - Next.js Build Configuration
 * ================================================
 * This file configures the Next.js build pipeline. Key settings:
 *
 * reactStrictMode: true
 *   Enables additional development-time warnings about:
 *   - Components rendering twice (to catch side effects)
 *   - Deprecated lifecycle methods
 *   Keep this ON — it catches bugs early.
 *
 * To proxy API requests through Next.js (avoids CORS in some deployments):
 *   async rewrites() {
 *     return [{ source: '/api/:path*', destination: 'http://localhost:8000/api/:path*' }]
 *   }
 * This is not used here since CORS is configured on the FastAPI side.
 */

const nextConfig = {
  reactStrictMode: true,

  // Proxy /api/* requests to the FastAPI backend in development.
  // This avoids needing NEXT_PUBLIC_API_URL in .env.local and works
  // the same way as the production nginx reverse-proxy setup.
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: 'http://localhost:8000/api/:path*',
      },
    ];
  },

  // Allow images from external domains if you add patient photos later
  // images: { domains: ['your-image-cdn.com'] },
};

module.exports = nextConfig;
