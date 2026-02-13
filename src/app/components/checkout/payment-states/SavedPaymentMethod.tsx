'use client';

import type { HostedFieldsEvent } from 'braintree-web/hosted-fields';

import * as braintree from 'braintree-web';
import { useCallback, useEffect, useRef, useState } from 'react';

import type { SavedPaymentMethod } from '@/lib/api/checkout-details';
import type { ThemeVariant } from '@/lib/styles/theme';

import { Button, ErrorMessage } from '@/components/ui';
import { useBraintreeClient } from '@/lib/payment/useBraintreeClient';
import { getFloatingLabelWrapperClass } from '@/lib/styles/theme';

interface SavedPaymentMethodProps {
  isVisible?: boolean;
  onComplete: (nonce: string) => Promise<void>;
  onUseDifferentMethod: () => void;
  savedPaymentMethod: SavedPaymentMethod;
  variant?: ThemeVariant;
}

const themeStyles: Record<
  ThemeVariant,
  {
    cardDisplay: string;
    cardText: string;
    cvvBg: string;
    cvvLoadingBg: string;
    cvvNotReady: string;
    cvvReady: string;
    expText: string;
    form: string;
    link: string;
  }
> = {
  dark: {
    cardDisplay: 'rounded-lg border border-white/30 bg-luminex-input p-4',
    cardText: 'text-white',
    cvvBg: '#4a5078',
    cvvLoadingBg: '#4a5078',
    cvvNotReady: 'pointer-events-none border',
    cvvReady: 'border',
    expText: 'text-sm text-white/70',
    form: 'w-full max-w-[400px] space-y-4 rounded-xl border border-luminex-border-30 bg-luminex-card-50 p-5',
    link: 'flex items-center gap-2 text-sm text-accent-cyan hover:underline',
  },
  light: {
    cardDisplay: 'rounded-lg border border-gray-300 bg-white p-4',
    cardText: 'text-brand-text',
    cvvBg: '#ffffff',
    cvvLoadingBg: '#f3f4f6',
    cvvNotReady: 'pointer-events-none border border-gray-300 bg-gray-100',
    cvvReady: 'border border-gray-300 bg-white',
    expText: 'text-sm text-gray-600',
    form: 'w-full max-w-[400px] space-y-4',
    link: 'flex items-center gap-2 text-sm text-blue-600 hover:underline',
  },
};

export default function SavedPaymentMethodForm({
  isVisible = true,
  onComplete,
  onUseDifferentMethod,
  savedPaymentMethod,
  variant = 'light',
}: SavedPaymentMethodProps) {
  const [isProcessing, setIsProcessing] = useState(false);
  const [isFieldReady, setIsFieldReady] = useState(false);
  const [error, setError] = useState<null | string>(null);
  const [hasAttemptedSubmit, setHasAttemptedSubmit] = useState(false);
  const hostedFieldsRef = useRef<braintree.HostedFields | null>(null);
  const cvvContainerRef = useRef<HTMLDivElement>(null);
  const initAttemptedRef = useRef(false);

  const isDark = variant === 'dark';
  const styles = themeStyles[variant];
  const wrapperClass = `${getFloatingLabelWrapperClass(variant)} hosted-field-wrapper`;

  const validateForm = useCallback((): null | string => {
    if (!hostedFieldsRef.current) return null;

    const state = hostedFieldsRef.current.getState();
    const cvvField = state.fields.cvv;

    if (cvvField.isEmpty) {
      return 'Please enter your security code (CVV)';
    }

    if (!cvvField.isValid) {
      return 'Please enter a valid security code (CVV)';
    }

    return null;
  }, []);

  const runValidation = useCallback(() => {
    if (!hasAttemptedSubmit) return;
    const validationError = validateForm();
    setError(validationError);
  }, [hasAttemptedSubmit, validateForm]);

  // Ref to store the latest runValidation for use in event handlers
  const runValidationRef = useRef(runValidation);
  useEffect(() => {
    runValidationRef.current = runValidation;
  }, [runValidation]);

  const {
    client: braintreeClient,
    error: clientError,
    isLoading: isClientLoading,
  } = useBraintreeClient();

  useEffect(() => {
    // If hosted fields already exist (e.g., from React Strict Mode double-run),
    // reuse them instead of trying to create new ones
    if (hostedFieldsRef.current) {
      setIsFieldReady(true);
      return;
    }

    if (initAttemptedRef.current) return;
    if (!braintreeClient) return;
    if (!cvvContainerRef.current) return;

    const client = braintreeClient;
    const container = cvvContainerRef.current;

    initAttemptedRef.current = true;
    let mounted = true;

    async function initializeCvvField() {
      try {
        const hostedFieldsInstance = await braintree.hostedFields.create({
          client,
          fields: {
            cvv: {
              container,
              placeholder: ' ',
            },
          },
          styles: {
            '::placeholder': {
              color: '#9ca3af',
            },
            input: {
              background: 'transparent',
              color: isDark ? '#ffffff' : '#1d192c',
              'font-family': 'General Sans, sans-serif',
              'font-size': '16px',
              'font-weight': '400',
              'line-height': '56px',
              padding: '0 16px',
            },
            'input.invalid': {
              color: '#ef4444',
            },
          },
        });

        // Always store the ref and set ready state - even if cleanup ran during async
        // (React Strict Mode simulates cleanup but doesn't actually unmount)
        hostedFieldsRef.current = hostedFieldsInstance;
        setIsFieldReady(true);

        // Only set up event handlers if still mounted
        if (!mounted) return;

        hostedFieldsInstance.on('focus', (event: HostedFieldsEvent) => {
          const field = event.fields[event.emittedBy];
          const wrapper = field.container.closest('.dynamic-input-label-wrapper');
          if (wrapper) {
            wrapper.classList.add('is-focused');
          }
        });

        hostedFieldsInstance.on('blur', (event: HostedFieldsEvent) => {
          const field = event.fields[event.emittedBy];
          const wrapper = field.container.closest('.dynamic-input-label-wrapper');
          if (wrapper) {
            wrapper.classList.remove('is-focused');
            if (!field.isEmpty) {
              wrapper.classList.add('has-content');
            } else {
              wrapper.classList.remove('has-content');
            }
          }
        });

        hostedFieldsInstance.on('validityChange', () => {
          runValidationRef.current();
        });

        hostedFieldsInstance.on('notEmpty', () => {
          runValidationRef.current();
        });
      } catch (err) {
        console.error('Failed to initialize CVV field:', err);
        if (mounted) {
          setError('Failed to initialize payment form');
        }
      }
    }

    void initializeCvvField();

    return () => {
      mounted = false;
    };
  }, [braintreeClient, isDark]);

  // Clear CVV field on visibility toggle (for security)
  useEffect(() => {
    if (!isVisible) {
      // Clear CVV when hidden for security
      if (hostedFieldsRef.current) {
        hostedFieldsRef.current.clear('cvv');
      }

      // Reset validation and processing state
      setHasAttemptedSubmit(false);
      setError(null);
      setIsProcessing(false);

      // Remove has-content class from CVV wrapper since field is now empty
      // This resets the floating label to its default position
      if (cvvContainerRef.current) {
        const wrapper = cvvContainerRef.current.closest('.dynamic-input-label-wrapper');
        if (wrapper) {
          wrapper.classList.remove('has-content');
          wrapper.classList.remove('is-focused');
        }
      }
    }
  }, [isVisible]);

  // Handle client error
  useEffect(() => {
    if (clientError) {
      setError(clientError.message);
    }
  }, [clientError]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setHasAttemptedSubmit(true);

    if (!hostedFieldsRef.current) {
      setError('Payment form not ready');
      return;
    }

    const validationError = validateForm();
    if (validationError) {
      setError(validationError);
      return;
    }

    setIsProcessing(true);
    setError(null);

    try {
      const { nonce } = await hostedFieldsRef.current.tokenize();
      await onComplete(nonce);
    } catch (err) {
      console.error('CVV tokenization failed:', err);
      setError('Invalid security code. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  const getCardBrandClass = (brand?: string) => {
    switch (brand?.toLowerCase()) {
      case 'american-express':
      case 'amex':
        return 'text-[#006FCF]';
      case 'mastercard':
        return 'text-[#EB001B]';
      case 'visa':
        return isDark ? 'text-[#5A7FFF]' : 'text-[#1A1F71]';
      default:
        return isDark ? 'text-white' : 'text-gray-600';
    }
  };

  const isLoading = isClientLoading || !isFieldReady;
  const cvvBg = isLoading ? styles.cvvLoadingBg : styles.cvvBg;

  return (
    <form aria-hidden={!isVisible} className={styles.form} onSubmit={handleSubmit}>
      {isDark && <h3 className="pb-4 text-lg font-semibold text-white">Complete your purchase</h3>}

      {error && <ErrorMessage theme={variant}>{error}</ErrorMessage>}

      <div className={styles.cardDisplay}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={`font-bold ${getCardBrandClass(savedPaymentMethod.cardBrand)}`}>
              {savedPaymentMethod.cardBrand?.toUpperCase() || 'CARD'}
            </div>
            <div className={styles.cardText}>ending in {savedPaymentMethod.lastFourDigits}</div>
          </div>
          <div className={styles.expText}>Exp {savedPaymentMethod.expirationDate}</div>
        </div>
      </div>

      <div className={`${wrapperClass} ${isLoading ? 'is-loading' : ''}`}>
        <div
          className={`hosted-field cvv-number-block h-input w-full rounded-lg transition-all ${
            !isLoading ? styles.cvvReady : styles.cvvNotReady
          }`}
          id="saved-cvv-field"
          ref={cvvContainerRef}
          style={{ backgroundColor: cvvBg }}
        ></div>
        <label className="dynamic-label">Security Code (CVV)</label>
      </div>

      <Button
        className="track-click"
        data-element_id="submit_credit_card"
        data-element_type="button"
        data-page_section="express_checkout"
        disabled={isProcessing || isLoading}
        tabIndex={isVisible ? 0 : -1}
        theme={variant}
        type="submit"
      >
        {isProcessing ? 'Processing...' : isLoading ? 'Loading...' : 'Complete your purchase'}
      </Button>

      <button
        className={`track-click ${styles.link}`}
        data-element_id="change_payment_method"
        data-element_type="button"
        data-page_section="express_checkout"
        onClick={onUseDifferentMethod}
        tabIndex={isVisible ? 0 : -1}
        type="button"
      >
        Use a different payment method
      </button>
    </form>
  );
}
