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

// const withPWA = require("@ducanh2912/next-pwa").default({
//     dest: "public",
//     disable: process.env.NODE_ENV === "development",
//     register: true,
//     skipWaiting: true,
// });

// export default withPWA(nextConfig);
export default nextConfig;
