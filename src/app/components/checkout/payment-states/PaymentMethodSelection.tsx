'use client';

import { ArrowLeft } from 'lucide-react';
import { useCallback, useEffect, useRef, useState } from 'react';

import type { SavedPaymentMethod } from '@/lib/api/checkout-details';
import type { ThemeVariant } from '@/lib/styles/theme';

import PayPalPayment from '../payment-forms/PayPalPayment';
import ApplePayButton from '../payment-methods/ApplePayButton';
import CreditCardButton from '../payment-methods/CreditCardButton';
import GooglePayButton from '../payment-methods/GooglePayButton';

interface PaymentMethodSelectionProps {
  amount: string;
  currencyCode: string;
  isApplePayInitializing?: boolean;
  isGooglePayInitializing?: boolean;
  isVisible?: boolean;
  onPayPalCancel: () => void;
  onPayPalComplete: (
    nonce: string,
    details: { email: string; firstName: string; lastName: string; zipCode: string }
  ) => void;
  onPayPalError: (error: Error) => void;
  onSelectApplePay: () => void;
  onSelectCreditCard: () => void;
  onSelectGooglePay: () => void;
  onUseSavedPayment?: () => void;
  savedPaymentMethod?: SavedPaymentMethod;
  skipTermsValidation?: boolean;
  variant?: ThemeVariant;
}

const themeStyles: Record<
  ThemeVariant,
  {
    savedContainer: string;
    savedIcon: string;
    savedLink: string;
    savedText: string;
    title: string;
  }
> = {
  dark: {
    savedContainer: 'border-luminex-border-30 bg-luminex-card-50',
    savedIcon: 'text-blue-400',
    savedLink: 'text-blue-400 hover:text-blue-300',
    savedText: 'text-white/90',
    title: 'font-medium text-white',
  },
  light: {
    savedContainer: 'border-blue-200 bg-blue-50',
    savedIcon: 'text-blue-600',
    savedLink: 'text-blue-600 hover:underline',
    savedText: 'text-blue-900',
    title: 'font-medium text-brand-text',
  },
};

export default function PaymentMethodSelection({
  amount,
  currencyCode,
  isApplePayInitializing = false,
  isGooglePayInitializing = false,
  isVisible = true,
  onPayPalCancel,
  onPayPalComplete,
  onPayPalError,
  onSelectApplePay,
  onSelectCreditCard,
  onSelectGooglePay,
  onUseSavedPayment,
  savedPaymentMethod,
  skipTermsValidation = false,
  variant = 'light',
}: PaymentMethodSelectionProps) {
  const [isProcessing, setIsProcessing] = useState(false);
  const [showApplePay, setShowApplePay] = useState(true);
  const processingTimeoutRef = useRef<null | ReturnType<typeof setTimeout>>(null);

  const styles = themeStyles[variant];

  // Clear any pending timeout
  const clearProcessingTimeout = useCallback(() => {
    if (processingTimeoutRef.current) {
      clearTimeout(processingTimeoutRef.current);
      processingTimeoutRef.current = null;
    }
  }, []);

  // Detect Android to hide Apple Pay
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const ua = navigator.userAgent.toLowerCase();
      const isAndroid = ua.indexOf('android') > -1;

      if (isAndroid) {
        setShowApplePay(false);
      }
    }
  }, []);

  // Reset processing state when visibility changes and cleanup on unmount
  useEffect(() => {
    if (!isVisible) {
      clearProcessingTimeout();
      setIsProcessing(false);
    }

    return () => {
      clearProcessingTimeout();
    };
  }, [isVisible, clearProcessingTimeout]);

  const handlePaymentMethod = (handler: () => void) => {
    // Clear any existing timeout before starting a new one
    clearProcessingTimeout();
    setIsProcessing(true);
    handler();
    processingTimeoutRef.current = setTimeout(() => setIsProcessing(false), 1000);
  };

  return (
    <div aria-hidden={!isVisible} className="space-y-4">
      <h3 className={`mb-4 text-xl ${styles.title}`}>Select your payment method</h3>

      {/* Apple Pay - Show on all platforms except Android (original behavior) */}
      {showApplePay && (
        <ApplePayButton
          disabled={isProcessing}
          isLoading={isApplePayInitializing}
          onClick={() => handlePaymentMethod(onSelectApplePay)}
          variant={variant}
        />
      )}

      {/* Google Pay + PayPal - Side by side on mobile (PayPal first), stacked on desktop (Google Pay first) */}
      <div className="flex max-w-[400px] flex-row-reverse gap-4 md:flex-col md:gap-4">
        <div className="min-w-0 flex-1">
          <GooglePayButton
            disabled={isProcessing}
            isLoading={isGooglePayInitializing}
            onClick={() => handlePaymentMethod(onSelectGooglePay)}
            variant={variant}
          />
        </div>

        <PayPalPayment
          amount={amount}
          currencyCode={currencyCode}
          disabled={isProcessing}
          isVisible={isVisible}
          onCancel={onPayPalCancel}
          onComplete={onPayPalComplete}
          onError={onPayPalError}
          skipTermsValidation={skipTermsValidation}
        />
      </div>

      {/* Credit Card - Full Width */}
      <CreditCardButton
        disabled={isProcessing}
        onClick={() => handlePaymentMethod(onSelectCreditCard)}
        variant={variant}
      />

      {savedPaymentMethod && onUseSavedPayment && (
        <div className={`mt-6 w-full max-w-[400px] rounded-lg border p-4 ${styles.savedContainer}`}>
          <div className="mb-2 flex items-center gap-2">
            <svg
              className={`h-5 w-5 flex-shrink-0 ${styles.savedIcon}`}
              fill="none"
              stroke="currentColor"
              strokeWidth={2}
              viewBox="0 0 24 24"
            >
              <circle cx="12" cy="12" r="10" />
              <path d="M12 16v-4M12 8h.01" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            <span className={`text-sm font-medium ${styles.savedText}`}>
              You have a saved payment method
            </span>
          </div>
          <button
            className={`flex items-center gap-2 text-sm ${styles.savedLink}`}
            onClick={onUseSavedPayment}
            type="button"
          >
            <ArrowLeft className="h-4 w-4" />
            Use saved payment ({savedPaymentMethod.cardBrand} ••••{' '}
            {savedPaymentMethod.lastFourDigits})
          </button>
        </div>
      )}
    </div>
  );
}
