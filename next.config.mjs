/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'bzdciswoqmodlhklcent.supabase.co',
        pathname: '/storage/v1/object/public/**',
      },
      {
        protocol: 'https',
        hostname: 'res.cloudinary.com',
      },
    ],
  },
}

// allowedDevOrigins is a development-only setting — never ship to production
if (process.env.NODE_ENV === 'development') {
  nextConfig.allowedDevOrigins = ['10.11.201.137']
}

export default nextConfig
