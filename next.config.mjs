/** @type {import('next').NextConfig} */
const nextConfig = {
    // คงการตั้งค่าเดิมไว้
    reactStrictMode: true,
    swcMinify: true,
    
    // เพิ่ม SEO และ Performance optimizations
    compress: true,
    poweredByHeader: false,
    generateEtags: false,
    
    // Image optimization
    images: {
      domains: ['www.dohsaving.com'],
      formats: ['image/webp', 'image/avif'],
    },
    
    // Security และ SEO headers
    async headers() {
      return [
        {
          source: '/(.*)',
          headers: [
            // Security headers
            {
              key: 'X-Content-Type-Options',
              value: 'nosniff',
            },
            {
              key: 'X-Frame-Options',
              value: 'DENY',
            },
            {
              key: 'X-XSS-Protection',
              value: '1; mode=block',
            },
            {
              key: 'Referrer-Policy',
              value: 'strict-origin-when-cross-origin',
            },
            // SEO headers
            {
              key: 'X-Robots-Tag',
              value: 'index, follow',
            },
          ],
        },
      ];
    },
    
    // Redirects สำหรับ SEO (ถ้าจำเป็น)
    async redirects() {
      return [
        {
          source: '/home',
          destination: '/',
          permanent: true,
        },
        // เพิ่ม redirects อื่นๆ ตามต้องการ
      ];
    },
  };
  
  export default nextConfig;