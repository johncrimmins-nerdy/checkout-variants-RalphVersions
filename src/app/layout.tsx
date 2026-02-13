import type { Metadata } from 'next';

import { Karla, Poppins } from 'next/font/google';
import Script from 'next/script';
import { Suspense } from 'react';

import { ErrorBoundary } from '@/components/ErrorBoundary';
import { AnalyticsProvider } from '@/lib/analytics';
import { MetaPixelLoader } from '@/lib/analytics/MetaPixelLoader';
import { getNewRelicInitScript } from '@/lib/analytics/newrelic-browser';
import { SessionContextProvider } from '@/lib/context/SessionContextProvider';
import { LaunchDarklyBridge } from '@/lib/flags';
import { assetUrl } from '@/lib/utils/asset-url';

import './globals.css';

const metaPixelId = process.env.NEXT_PUBLIC_META_PIXEL_ID;

// Poppins - Primary font for the entire app (matches original Webflow --all-fonts--primary-family)
// Weight 300 needed for "Live+AI" text (poppins-light class in original)
const poppins = Poppins({
  display: 'swap',
  subsets: ['latin'],
  variable: '--font-poppins',
  weight: ['300', '400', '500', '600', '700'],
});

// Karla - Only used for feature bullet text on luminex welcome-back page
const karla = Karla({
  display: 'swap',
  subsets: ['latin'],
  variable: '--font-karla',
  weight: ['400', '500', '600', '700'],
});

export const metadata: Metadata = {
  description: 'Complete your purchase and start learning with Varsity Tutors',
  title: 'Varsity Tutors - Checkout',
};

// PayPal client ID from environment (configured per-environment in netlify.toml)
const paypalClientId = process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID;

// reCAPTCHA site key from environment (configured per-environment in netlify.toml)
const recaptchaSiteKey = process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY;

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const newRelicScript = getNewRelicInitScript();

  return (
    <html className={`${poppins.variable} ${karla.variable}`} lang="en">
      <head>
        {/* Apple Touch Icon - Used by Apple Pay for merchant logo in payment sheet */}
        <link href={assetUrl('/images/webclip.png')} rel="apple-touch-icon" />
        {newRelicScript && (
          <>
            {/* New Relic Browser Agent - Configuration */}
            <Script
              dangerouslySetInnerHTML={{ __html: newRelicScript }}
              id="newrelic-config"
              strategy="beforeInteractive"
            />
            {/* New Relic Browser Agent - Loader */}
            <Script
              src="https://js-agent.newrelic.com/nr-loader-spa-1.303.0.min.js"
              strategy="beforeInteractive"
            />
          </>
        )}
        {/* Apple Pay SDK - Enables Apple Pay on Chrome via Payment Request API */}
        <Script
          src="https://applepay.cdn-apple.com/jsapi/1.latest/apple-pay-sdk.js"
          strategy="beforeInteractive"
        />
        {/* PayPal SDK - Environment-aware client ID */}
        <Script
          src={`https://www.paypal.com/sdk/js?client-id=${paypalClientId}&vault=true&intent=tokenize`}
          strategy="afterInteractive"
        />
        {/* Google Pay SDK */}
        <Script src="https://pay.google.com/gp/p/js/pay.js" strategy="afterInteractive" />
        {/* reCAPTCHA Enterprise - Plain script (no data-nscript) for ad blocker compatibility */}
        {recaptchaSiteKey && (
          // eslint-disable-next-line @next/next/no-sync-scripts
          <script
            src={`https://www.google.com/recaptcha/enterprise.js?render=${recaptchaSiteKey}`}
          />
        )}
      </head>
      <body className="antialiased">
        <ErrorBoundary>
          <LaunchDarklyBridge>
            <AnalyticsProvider>
              <Suspense fallback={null}>
                <SessionContextProvider>{children}</SessionContextProvider>
              </Suspense>
            </AnalyticsProvider>
          </LaunchDarklyBridge>
        </ErrorBoundary>
        {metaPixelId && <MetaPixelLoader pixelId={metaPixelId} />}
      </body>
    </html>
  );
}
