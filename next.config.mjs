/** @type {import('next').NextConfig} */
const nextConfig = {
  allowedDevOrigins: ['10.11.201.137'],
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

export default nextConfig
