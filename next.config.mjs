/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,

  images: {
    remotePatterns: [
      {
        protocol: 'http',
        hostname: 'localhost',
        port: '8000',
        pathname: '/**',
      },
    ],
  },

  webpack: (config) => {
    config.externals = [...(config.externals || []), { "react-beautiful-dnd": "react-beautiful-dnd" }];
    return config;
  },

  async rewrites() {
    return [
      // Redirect all API calls to Django backend except auth routes
      {
        source: '/api/:path*',
        destination: 'http://localhost:8000/api/:path*',
        has: [
          {
            type: 'query',
            key: 'path',
            value: '(?!auth).*', // Exclude `auth` routes from being rewritten
          },
        ],
      },
    ];
  },

  async headers() {
    return [
      {
        source: '/api/:path*',
        headers: [
          { key: 'Access-Control-Allow-Credentials', value: 'true' },
          { key: 'Access-Control-Allow-Origin', value: '*' },
          { key: 'Access-Control-Allow-Methods', value: 'GET,DELETE,PATCH,POST,PUT' },
          { key: 'Access-Control-Allow-Headers', value: 'Authorization, X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version' },
        ],
      },
    ];
  },
};

export default nextConfig;
