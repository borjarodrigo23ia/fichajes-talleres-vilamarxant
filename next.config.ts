import type { NextConfig } from "next";

const nextConfig: NextConfig = {
    reactStrictMode: true,
    compress: true,
    poweredByHeader: false,

    // Optimizaciones para móvil
    images: {
        formats: ['image/avif', 'image/webp'],
        deviceSizes: [640, 750, 828, 1080, 1200],
        imageSizes: [16, 32, 48, 64, 96, 128, 256],
    },
};

// Only apply PWA in production to avoid Turbopack/Dev-server hangs
export default nextConfig;
/* (process.env.NODE_ENV === 'production'
    ? require('next-pwa')({
        dest: 'public',
        disable: false,
        register: true,
        skipWaiting: true,
    })(nextConfig)
    : nextConfig
); */
