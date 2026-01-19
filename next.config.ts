import type {NextConfig} from 'next';

const nextConfig: NextConfig = {
  /* config options here */
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'placehold.co',
        port: '',
        pathname: '/**',
      },
    ],
  },
  webpack: (config, { isServer }) => {
    // Handle Handlebars require.extensions issue
    config.resolve.fallback = {
      ...config.resolve.fallback,
      fs: false,
    };
    
    // Ignore optional OpenTelemetry dependencies
    config.externals = config.externals || [];
    if (isServer) {
      config.externals.push('@opentelemetry/exporter-jaeger');
    }
    
    return config;
  },
};

export default nextConfig;
