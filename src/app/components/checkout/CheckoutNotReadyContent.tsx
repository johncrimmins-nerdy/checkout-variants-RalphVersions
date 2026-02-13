'use client';

import Image from 'next/image';
import { useEffect, useRef, useState } from 'react';

import type { ThemeVariant } from '@/lib/styles/theme';

import { Button } from '@/components/ui';
import { trackUserEmailAlreadyExists } from '@/lib/analytics/checkout-tracking';
import { newRelicTrack } from '@/lib/analytics/error-tracking';
import { NewRelicEvent } from '@/lib/analytics/types';
import { assetUrl } from '@/lib/utils/asset-url';

interface CheckoutNotReadyContentProps {
  /** Error details for New Relic reporting (only for unknown errors) */
  errorDetails?: ErrorDetails;
  /** Error message to display */
  message: string;
  /** Whether to report this error to New Relic */
  reportToNewRelic?: boolean;
  /** Optional title override */
  title?: string;
  variant?: ThemeVariant;
}

/** Error details for reporting to New Relic */
interface ErrorDetails {
  /** Original error code from API */
  errorCode?: string;
  /** Original error message */
  errorMessage?: string;
  /** Underlying error details */
  underlyingError?: string;
}

export default function CheckoutNotReadyContent({
  errorDetails,
  message,
  reportToNewRelic = false,
  title = 'Something went wrong',
  variant = 'light',
}: CheckoutNotReadyContentProps) {
  const [hasPrevPage, setHasPrevPage] = useState(false);
  const isDark = variant === 'dark';
  const hasReportedRef = useRef(false);

  // Track errors to New Relic on mount
  useEffect(() => {
    if (hasReportedRef.current) return;
    if (typeof window === 'undefined' || !window.newrelic) return;

    const errorCode = errorDetails?.errorCode;

    // Track specific known error types
    if (errorCode === 'USER_ALREADY_EXISTS') {
      hasReportedRef.current = true;
      trackUserEmailAlreadyExists();
      return;
    }

    // Track unknown errors (when reportToNewRelic is true)
    if (reportToNewRelic) {
      hasReportedRef.current = true;

      const page = isDark ? 'welcome-back' : 'checkout';

      newRelicTrack(NewRelicEvent.UNKNOWN_CHECKOUT_ERROR, {
        error_code: errorCode || 'UNKNOWN',
        error_message: errorDetails?.errorMessage || message,
        page,
        path: window.location.pathname,
        search: window.location.search,
        underlying_error: errorDetails?.underlyingError?.slice(0, 500) || '',
      });

      if (window.newrelic) {
        const error = new Error(errorDetails?.errorMessage || message);
        window.newrelic.noticeError(error, {
          error_code: errorCode || 'UNKNOWN',
          page,
        });
      }

      console.debug('[CheckoutNotReadyContent] Reported unknown error to New Relic:', {
        errorCode,
        page,
      });
    }
  }, [reportToNewRelic, errorDetails, message, isDark]);

  useEffect(() => {
    // Only run in browser
    const referrer = document.referrer;
    const currentHostname = window.location.hostname;

    // Check if there's a referrer and it's from the same domain
    if (referrer && window.history.length > 1) {
      try {
        const referrerUrl = new URL(referrer);
        const isSameDomain =
          referrerUrl.hostname === currentHostname ||
          referrerUrl.hostname.endsWith('.varsitytutors.com') ||
          referrerUrl.hostname.endsWith('.vtstaging.com');

        setHasPrevPage(isSameDomain);
      } catch {
        setHasPrevPage(false);
      }
    }
  }, []);

  const handleGoBack = () => {
    if (hasPrevPage) {
      window.history.back();
    } else {
      // Redirect to homepage
      const currentHostname = window.location.hostname;
      const isProduction =
        currentHostname === 'www.varsitytutors.com' || currentHostname === 'varsitytutors.com';
      const homepage = isProduction ? 'https://www.varsitytutors.com' : 'https://www.vtstaging.com';
      window.location.href = homepage;
    }
  };

  return (
    <div className="flex flex-col items-center py-8 text-center">
      {/* Error Image - Using WebP for 90% smaller file size (72KB vs 746KB) */}
      <div className="mb-6">
        <Image
          alt="Item not found"
          className="mx-auto"
          height={200}
          src={assetUrl('/images/item_not_found.webp')}
          unoptimized
          width={200}
        />
      </div>

      {/* Error Title */}
      <h2 className={`mb-3 text-xl font-semibold ${isDark ? 'text-white' : 'text-gray-800'}`}>
        {title}
      </h2>

      {/* Error Description - with phone numbers as clickable links */}
      <p className={`mb-8 max-w-sm leading-relaxed ${isDark ? 'text-white/70' : 'text-gray-600'}`}>
        {formatMessageWithPhoneLinks(message, isDark)}
      </p>

      <Button className="max-w-xs" onClick={handleGoBack} theme={variant} type="button">
        {hasPrevPage ? 'Go Back' : 'Go to Homepage'}
      </Button>
    </div>
  );
}

/**
 * Converts phone numbers in text to clickable tel: links
 * Matches formats like: 888-888-0446, (888) 888-0446, 888.888.0446
 */
function formatMessageWithPhoneLinks(message: string, isDark = false): React.ReactNode {
  // Regex to match common US phone number formats
  const phoneRegex = /(\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4})/g;

  const parts = message.split(phoneRegex);

  if (parts.length === 1) {
    // No phone number found
    return message;
  }

  return parts.map((part, index) => {
    if (phoneRegex.test(part)) {
      // Reset regex lastIndex after test
      phoneRegex.lastIndex = 0;
      // Strip non-digits for the tel: href
      const phoneDigits = part.replace(/\D/g, '');
      return (
        <a
          className={`font-medium underline ${
            isDark
              ? 'text-accent-cyan hover:text-accent-cyan-hover'
              : 'text-brand-selection hover:text-brand-selection/80'
          }`}
          href={`tel:+1${phoneDigits}`}
          key={index}
        >
          {part}
        </a>
      );
    }
    return part;
  });
}
