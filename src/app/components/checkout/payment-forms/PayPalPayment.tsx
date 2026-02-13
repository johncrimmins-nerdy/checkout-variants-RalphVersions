'use client';

/**
 * PayPal payment component
 * Renders PayPal button and handles payment flow
 *
 * Supports visibility toggling - when hidden via CSS, the PayPal button
 * stays initialized to avoid re-initialization on show.
 */

import Image from 'next/image';
import { useEffect, useRef, useState } from 'react';

import { trackElementClicked } from '@/lib/analytics';
import { initPayPal } from '@/lib/payment/init-paypal';
import { useBraintreeClient } from '@/lib/payment/useBraintreeClient';
import { assetUrl } from '@/lib/utils/asset-url';

export interface PayPalDetails {
  email: string;
  firstName: string;
  lastName: string;
  zipCode: string;
}

interface PayPalPaymentProps {
  amount: string;
  currencyCode: string;
  disabled: boolean;
  /** Whether this button is currently visible */
  isVisible?: boolean;
  onCancel: () => void;
  onComplete: (nonce: string, details: PayPalDetails) => void;
  onError: (error: Error) => void;
  /** Skip terms validation for returning users (reactivation flow) */
  skipTermsValidation?: boolean;
}

export default function PayPalPayment({
  amount,
  currencyCode,
  disabled,
  isVisible = true,
  onCancel,
  onComplete,
  onError,
  skipTermsValidation = false,
}: PayPalPaymentProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [isButtonRendered, setIsButtonRendered] = useState(false);
  const [initFailed, setInitFailed] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const initAttemptedRef = useRef(false);

  // Use refs to always get the latest values in PayPal callbacks
  // This ensures plan switching updates are reflected in the PayPal flow
  // The PayPal button is initialized once, but these refs allow callbacks
  // to access the current props when the user clicks the button
  const amountRef = useRef(amount);
  const currencyCodeRef = useRef(currencyCode);
  const onCompleteRef = useRef(onComplete);

  // Keep refs in sync with props
  useEffect(() => {
    amountRef.current = amount;
    currencyCodeRef.current = currencyCode;
    onCompleteRef.current = onComplete;
  }, [amount, currencyCode, onComplete]);

  // Use shared Braintree client
  const { client: braintreeClient, isLoading: isClientLoading } = useBraintreeClient();

  useEffect(() => {
    // Only initialize once
    if (initAttemptedRef.current) return;
    if (!braintreeClient) return;

    // Capture reference for use in async function
    const client = braintreeClient;

    initAttemptedRef.current = true;
    let mounted = true;

    async function setupPayPal() {
      try {
        // Wait for PayPal SDK to load (it's loaded via script tag)
        let attempts = 0;
        while (!window.paypal && attempts < 50) {
          await new Promise((resolve) => setTimeout(resolve, 100));
          attempts++;
        }

        if (!window.paypal) {
          console.error('PayPal SDK failed to load after 5 seconds');
          setInitFailed(true);
          return;
        }

        console.log('✅ PayPal SDK loaded, initializing...');

        if (!containerRef.current) {
          console.warn('PayPal container not ready');
          setInitFailed(true);
          return;
        }

        // Clear any existing buttons
        if (containerRef.current) {
          containerRef.current.innerHTML = '';
        }

        if (!mounted) return;

        const paypalInstance = await initPayPal(client);
        if (!paypalInstance || !mounted) return;

        // Hide placeholder before rendering real button
        setIsLoading(false);

        // Render PayPal button
        window.paypal
          .Buttons({
            createBillingAgreement: () => {
              trackElementClicked('paypal', 'button', 'express_checkout');
              // Use refs to get the latest amount/currency (handles plan switching)
              return paypalInstance.createPayment({
                amount: amountRef.current,
                currency: currencyCodeRef.current,
                displayName: 'Varsity Tutors',
                enableShippingAddress: true,
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                flow: 'vault' as any,
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                intent: 'capture' as any,
              });
            },
            fundingSource: 'paypal',
            onApprove: async (data: {
              billingToken: string;
              payerID: string;
              paymentID: string;
            }) => {
              try {
                // Tokenize the payment
                const tokenized = await paypalInstance.tokenizePayment({
                  billingToken: data.billingToken,
                  payerId: data.payerID,
                  paymentId: data.paymentID,
                  vault: true,
                });

                // Use ref to get the latest onComplete callback (handles plan switching)
                onCompleteRef.current(tokenized.nonce, {
                  email: tokenized.details.email || '',
                  firstName: tokenized.details.firstName || '',
                  lastName: tokenized.details.lastName || '',
                  zipCode: tokenized.details.shippingAddress?.postalCode || '',
                });
              } catch (error) {
                onError(error instanceof Error ? error : new Error('PayPal payment failed'));
              }
            },
            onCancel: () => {
              onCancel();
            },
            onClick: () => {
              // Skip terms validation for returning users (reactivation flow)
              if (skipTermsValidation) return;

              // Show error message if terms not accepted (fallback - button should already be disabled)
              const termsCheckbox = document.querySelector(
                'input[name="Agree-To-Terms-Checkbox"]'
              ) as HTMLInputElement;
              if (!termsCheckbox?.checked) {
                onError(new Error('Please accept the terms and conditions'));
              }
            },
            onError: (err: Error) => {
              onError(err);
            },
            onInit: (_data: unknown, actions: { disable: () => void; enable: () => void }) => {
              // Helper to safely call actions (handles closed PayPal window)
              const safeAction = (action: () => void) => {
                if (!mounted) return;
                try {
                  action();
                } catch (_err) {
                  // Silently ignore errors from closed PayPal button window
                  // This can happen when component unmounts or re-renders
                }
              };

              // For returning users (reactivation flow), enable button immediately
              if (skipTermsValidation) {
                safeAction(() => actions.enable());
                setIsButtonRendered(true);
                return;
              }

              // Start with button disabled
              safeAction(() => actions.disable());
              setIsButtonRendered(true);

              // Check initial state and enable if terms already accepted
              const termsCheckbox = document.querySelector(
                'input[name="Agree-To-Terms-Checkbox"]'
              ) as HTMLInputElement;
              if (termsCheckbox?.checked) {
                safeAction(() => actions.enable());
              }

              // Listen for form changes to dynamically enable/disable
              const checkoutForm = document.querySelector('#Checkout-Form') as HTMLFormElement;
              if (checkoutForm) {
                const handleFormChange = (e: Event) => {
                  const target = e.target as HTMLInputElement;
                  // Only react to the terms checkbox
                  if (target.name === 'Agree-To-Terms-Checkbox') {
                    if (target.checked) {
                      safeAction(() => actions.enable());
                    } else {
                      safeAction(() => actions.disable());
                    }
                  }
                };

                checkoutForm.addEventListener('change', handleFormChange);
              }
            },
            style: {
              borderRadius: 6,
              color: 'gold',
              height: 54,
              label: 'paypal',
            },
          })
          .render(containerRef.current!);
      } catch (error) {
        console.error('PayPal initialization failed:', error);
        if (mounted) {
          setInitFailed(true);
        }
      }
    }

    void setupPayPal();

    return () => {
      mounted = false;
      // Don't cleanup PayPal button - allow parent to control visibility
      // This enables instant switching between payment methods
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [braintreeClient]); // Re-run only when client becomes available

  if (initFailed) {
    return null;
  }

  const showPlaceholder = isClientLoading || isLoading;

  return (
    <div
      aria-hidden={!isVisible}
      className="track-click relative min-w-0 flex-1"
      data-element_id="paypal_button"
      data-element_type="button"
      data-page_section="express_checkout"
      style={{ maxWidth: '400px' }}
    >
      {/* Placeholder button - shown while PayPal SDK loads */}
      {showPlaceholder && (
        <div className="flex h-[54px] w-full cursor-not-allowed items-center justify-center rounded-btn bg-[#FFC439] opacity-60">
          <Image
            alt="PayPal"
            className="animate-pulse"
            height={24}
            src={assetUrl('/images/paypal-button-checkout-logo.svg')}
            style={{ height: '24px', maxWidth: 'none', width: '75.75px' }}
            unoptimized
            width={75.75}
          />
        </div>
      )}

      {/* Real PayPal SDK button - renders here */}
      {/* Note: relative + z-0 creates a stacking context to contain PayPal's high z-index iframe */}
      <div
        className={`relative z-0 ${disabled ? 'pointer-events-none opacity-50' : ''}`}
        ref={containerRef}
        style={{ display: showPlaceholder ? 'none' : 'block' }}
        tabIndex={isVisible && isButtonRendered ? 0 : -1}
      />
    </div>
  );
}
