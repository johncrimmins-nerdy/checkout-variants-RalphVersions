// Base Path Configuration
// Set via NEXT_PUBLIC_BASE_PATH environment variable
// Default: '/checkout'
const BASE_PATH = (process.env.NEXT_PUBLIC_BASE_PATH ?? '/checkout').replace(/\/$/, '');
const _HOST = process.env.NEXT_PUBLIC_HOST ?? 'https://www.varsitytutors.com';
const _BASE_URL = `${_HOST}${BASE_PATH}`;

// Source Maps Configuration
// Enable source maps generation when UPLOAD_SOURCEMAPS=true (for New Relic error tracking)
const GENERATE_SOURCEMAPS = process.env.UPLOAD_SOURCEMAPS === 'true';

/** @type {import('next').NextConfig} */
const nextConfig = {
  // Environment-based base path configuration
  basePath: BASE_PATH,
  compress: true,
  async headers() {
    // Build CSP policy for checkout application
    const vtHost = process.env.NEXT_PUBLIC_VT_HOST || 'https://www.vtstaging.com';
    const wildcardHost = vtHost.replace('www', '*');

    const cspDirectives = [
      // Default source - same origin only
      "default-src 'self'",

      // Scripts - allow inline scripts, Google services, Stripe, and analytics
      `script-src 'self' 'unsafe-inline' 'unsafe-eval'
        https://*.googletagmanager.com
        https://*.google-analytics.com
        https://*.google.com
        https://pay.google.com
        https://applepay.cdn-apple.com
        https://*.braintreegateway.com
        https://js.braintreegateway.com
        https://*.paypal.com
        https://www.paypal.com
        https://www.paypalobjects.com
        https://bam.nr-data.net
        https://js-agent.newrelic.com
        https://www.gstatic.com
        https://js.stripe.com
        https://cdn.segment.com
        https://*.amplitude.com
        https://checkout-wf.netlify.app
        ${wildcardHost}`,

      // Styles - allow inline styles and Google Fonts
      `style-src 'self' 'unsafe-inline'
        https://fonts.googleapis.com
        ${wildcardHost}`,

      // Images - allow data URIs and VT CDNs
      `img-src 'self' data: https: blob:
        https://vt-vtwa-assets.varsitytutors.com
        https://cdn-s3.varsitytutors.com
        https://videos.varsitytutors.com
        https://llt.imgix.net
        ${wildcardHost}`,

      // Fonts - allow data URIs and Google Fonts
      "font-src 'self' data: https://fonts.gstatic.com",

      // Connect (fetch/XHR) - allow API calls
      `connect-src 'self'
        https://*.varsitytutors.com
        https://*.vtstaging.com
        https://*.googleadservices.com
        https://*.google-analytics.com
        https://*.google.com
        https://google.com
        https://pay.google.com
        https://*.launchdarkly.com
        https://app.launchdarkly.com
        https://events.launchdarkly.com
        https://*.braintreegateway.com
        https://api.braintreegateway.com
        https://client-analytics.braintreegateway.com
        https://payments.braintree-api.com
        https://*.braintree-api.com
        https://bam.nr-data.net
        https://otlp.nr-data.net
        https://cdn.segment.com
        https://api.segment.io
        https://*.amplitude.com
        https://sr-client-cfg.amplitude.com
        https://api.amplitude.com
        https://*.stripe.com
        https://*.paypal.com
        ${wildcardHost}`,

      // Frames - allow Stripe, Braintree, and Apple Pay checkout iframes
      `frame-src 'self'
        https://js.stripe.com
        https://hooks.stripe.com
        https://applepay.cdn-apple.com
        https://*.cdn-apple.com
        https://assets.braintreegateway.com
        https://*.braintreegateway.com
        https://*.paypal.com
        https://*.google.com
        https://pay.google.com
        ${wildcardHost}`,

      // Frame ancestors - prevent clickjacking
      "frame-ancestors 'self'",

      // Base URI - restrict base tag
      "base-uri 'self'",

      // Form action - restrict form submissions
      "form-action 'self'",

      // Object/embed - disable plugins
      "object-src 'none'",

      // Media - allow VT video and audio assets
      `media-src 'self' blob:
        https://videos.varsitytutors.com
        https://*.s3.us-west-2.amazonaws.com
        ${wildcardHost}`,

      // Manifest - allow same origin and Google Pay manifest
      `manifest-src 'self'
        https://pay.google.com
        ${wildcardHost}`,

      // Upgrade insecure requests in production
      process.env.NODE_ENV === 'production' ? 'upgrade-insecure-requests' : '',
    ];

    return [
      {
        headers: [
          {
            key: 'X-DNS-Prefetch-Control',
            value: 'on',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'X-Frame-Options',
            value: 'SAMEORIGIN',
          },
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block',
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin',
          },
          {
            key: 'Permissions-Policy',
            value:
              'identity-credentials-get=(self "https://www.gstatic.com" "https://js.stripe.com")',
          },
          {
            key: 'Content-Security-Policy',
            value: cspDirectives.join('; ').replace(/[\s\n\r]+/g, ' '),
          },
        ],
        source: '/(.*)',
      },
    ];
  },
  // Image optimization
  images: {
    formats: ['image/avif', 'image/webp'],
    remotePatterns: [
      {
        hostname: '**',
        protocol: 'https',
      },
      {
        hostname: 'vt-vtwa-assets.varsitytutors.com',
        pathname: '/**',
        protocol: 'https',
      },
      {
        hostname: 'cdn-s3.varsitytutors.com',
        pathname: '/**',
        protocol: 'https',
      },
      {
        hostname: 'videos.varsitytutors.com',
        pathname: '/**',
        protocol: 'https',
      },
      {
        hostname: 'llt.imgix.net',
        pathname: '/**',
        protocol: 'https',
      },
    ],
  },

  poweredByHeader: false,

  // Optimize bundle
  // Source maps are conditionally enabled for New Relic error tracking uploads
  productionBrowserSourceMaps: GENERATE_SOURCEMAPS,

  reactStrictMode: true,

  // Redirect root to base path (platform-agnostic)
  async redirects() {
    return [
      {
        basePath: false,
        destination: BASE_PATH,
        permanent: false,
        source: '/',
      },
    ];
  },

  // Transpile VT internal packages
  transpilePackages: ['@blueshift-ui/telemetry'],

  webpack: (config, { dev, isServer }) => {
    // Exclude LaunchDarkly Node SDK from client bundles
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        child_process: false,
        fs: false,
        net: false,
        tls: false,
      };
    }

    // Strip console in production builds
    if (!dev) {
      const existingTerser = config.optimization.minimizer.find(
        (plugin) => plugin.constructor.name === 'TerserPlugin'
      );

      if (existingTerser) {
        existingTerser.options = {
          ...existingTerser.options,
          terserOptions: {
            ...existingTerser.options.terserOptions,
            compress: {
              ...existingTerser.options.terserOptions?.compress,
              drop_console: true,
            },
          },
        };
      }
    }

    // Configure source maps for New Relic uploads (hidden-source-map for security)
    if (!dev && !isServer && GENERATE_SOURCEMAPS) {
      config.devtool = 'hidden-source-map';
    }

    return config;
  },
};

export default nextConfig;
