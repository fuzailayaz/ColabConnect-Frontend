/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,

  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: (process.env.NEXT_PUBLIC_SUPABASE_URL || "https://nvbvklsjoaxftmglmsba.supabase.co").replace("https://", ""),
        pathname: "/storage/v1/object/public/**", // Allow images from Supabase storage
      },
    ],
  },

  webpack: (config) => {
    config.externals = [...(config.externals || []), { "react-beautiful-dnd": "react-beautiful-dnd" }];
    return config;
  },

  async rewrites() {
    return [
      {
        source: "/api/auth/:path*",
        destination: `${process.env.NEXT_PUBLIC_SUPABASE_URL || "https://nvbvklsjoaxftmglmsba.supabase.co"}/auth/v1/:path*`,
      },
      {
        source: "/api/storage/:path*",
        destination: `${process.env.NEXT_PUBLIC_SUPABASE_URL || "https://nvbvklsjoaxftmglmsba.supabase.co"}/storage/v1/:path*`,
      },
      {
        source: "/api/functions/:path*",
        destination: `${process.env.NEXT_PUBLIC_SUPABASE_URL || "https://nvbvklsjoaxftmglmsba.supabase.co"}/functions/v1/:path*`,
      },
    ];
  },
};

export default nextConfig;
