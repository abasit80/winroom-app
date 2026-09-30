/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [{ protocol: "https", hostname: "picsum.photos" }],
  },
  async redirects() {
    return [
      { source: "/visual-scraper", destination: "/dashboard/intel", permanent: false },
      { source: "/live", destination: "/dashboard/automation", permanent: false },
      { source: "/data", destination: "/dashboard/analytics", permanent: false },
      { source: "/enrich", destination: "/dashboard/intel", permanent: false },
      { source: "/workflows", destination: "/dashboard/workflows", permanent: false },
      { source: "/healing", destination: "/dashboard/automation", permanent: false },
      { source: "/connectors", destination: "/dashboard/connectors", permanent: false },
    ];
  },
};

export default nextConfig;
