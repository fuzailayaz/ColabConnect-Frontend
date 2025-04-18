require("dotenv").config();

module.exports = {
  env: {
    NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
    NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  },

  reactStrictMode: true,
  experimental: {
    serverActions: {},
  },
  
  // Configure webpack to handle MongoDB modules properly
  webpack: (config, { isServer }) => {
    // MongoDB modules should only be loaded on the server side
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        // These modules should not be bundled on the client side
        mongodb: false,
        'mongodb-client-encryption': false,
        aws4: false,
        kerberos: false,
        'supports-color': false,
        snappy: false,
        '@aws-sdk/credential-providers': false,
      };
    }
    return config;
  },

  async rewrites() {
    return [
      {
        source: "/api/:path*",
        destination: `${process.env.NEXT_PUBLIC_SUPABASE_URL || "https://nvbvklsjoaxftmglmsba.supabase.co"}/rest/v1/:path*`,
      },
    ];
  },

  async headers() {
    return [
      {
        source: "/api/:path*",
        headers: [
          { key: "Access-Control-Allow-Credentials", value: "true" },
          { key: "Access-Control-Allow-Origin", value: process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000" },
          { key: "Access-Control-Allow-Methods", value: "GET,DELETE,PATCH,POST,PUT" },
          { key: "Access-Control-Allow-Headers", value: "X-CSRF-Token, X-Requested-With, Accept, Content-Type, Authorization, apikey" },
        ],
      },
    ];
  },
};
