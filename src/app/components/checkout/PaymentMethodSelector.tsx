'use client';

import * as braintree from 'braintree-web';
import { useEffect, useMemo, useRef, useState } from 'react';

import type { CheckoutDetailsResponse } from '@/lib/api/checkout-details';
import type { GooglePayError, PurchaseResult } from '@/lib/payment/types';
import type { ThemeVariant } from '@/lib/styles/theme';
import type { ExtendedApplePayPaymentRequest } from '@/types/payment-providers';

import CreditCardForm, {
  type CreditCardFormData,
} from '@/app/components/checkout/payment-forms/CreditCardForm';
import GuestSignIn from '@/app/components/checkout/payment-states/GuestSignIn';
import PaymentMethodSelection from '@/app/components/checkout/payment-states/PaymentMethodSelection';
import SavedPaymentMethodForm from '@/app/components/checkout/payment-states/SavedPaymentMethod';
import PricingCard from '@/app/components/checkout/PricingCard';
import RecaptchaNotice from '@/app/components/checkout/RecaptchaNotice';
import TermsCheckbox from '@/app/components/checkout/TermsCheckbox';
import { ErrorMessage, Spinner } from '@/components/ui';
import { FLAGS, useFlags } from '@/hooks/use-flags';
import { IntegrationError, trackErrorWithContext, UserBehaviorError } from '@/lib/analytics';
import { purchaseMembership } from '@/lib/api/purchase-membership';
import { CHECKOUT_ERROR_MESSAGES, type CheckoutErrorCode } from '@/lib/constants/error-messages';
import { useSessionContext } from '@/lib/context/SessionContextProvider';
import { initApplePay } from '@/lib/payment/init-apple-pay';
import { initGooglePay } from '@/lib/payment/init-google-pay';
import { useBraintreeClient } from '@/lib/payment/useBraintreeClient';
import {
  buildPurchaseArgs,
  getEffectivePurchasable,
  isCardExpired,
  validateTermsAccepted,
} from '@/lib/payment/utils';
import { executeRecaptcha } from '@/lib/services/recaptcha-service';
import { getRedirectUrl } from '@/lib/utils/checkout-helpers';
import { getCountryFromCurrency } from '@/lib/utils/currency-to-country';
import { PaymentError } from '@/lib/utils/error-classes';

type PaymentMethod = 'apple_pay' | 'credit_card' | 'google_pay' | 'paypal' | 'saved_credit_card';

interface PaymentMethodSelectorProps {
  checkoutData: CheckoutDetailsResponse;
  hidePricingCard?: boolean;
  isLeadResubmissionFlow?: boolean;
  onLoginSuccess?: () => void;
  onPaymentSuccess?: (result: PurchaseResult, paymentMethod: PaymentMethod) => void;
  /** Optional: ID of the selected purchasable (for plan switching in welcome-back flow) */
  selectedPurchasableId?: string;
  skipTermsValidation?: boolean;
  variant?: ThemeVariant;
}

const processingOverlayStyles: Record<ThemeVariant, { container: string; text: string }> = {
  dark: {
    container: 'rounded-lg bg-gray-800 p-8 text-center',
    text: 'mt-4 text-lg font-semibold text-white',
  },
  light: {
    container: 'rounded-lg bg-white p-8 text-center',
    text: 'mt-4 text-lg font-semibold text-brand-text',
  },
};

// Helper to generate reCAPTCHA token
// Matches original behavior: returns empty string on failure but tracks the error
const getRecaptchaToken = async (): Promise<string> => {
  try {
    const token = await executeRecaptcha('purchaseMembership');

    if (!token) {
      console.warn('Empty reCAPTCHA token received');
      trackErrorWithContext(
        new IntegrationError('Empty reCAPTCHA token received', {
          payment_step: 'get-token',
        })
      );
    }

    return token || '';
  } catch (error) {
    console.error('Error fetching reCAPTCHA token:', error);
    trackErrorWithContext(
      new IntegrationError('Error fetching reCAPTCHA token', {
        payment_step: 'get-token',
      })
    );
    // Return empty string on failure - backend decides if purchase should proceed
    return '';
  }
};

/**
 * Visible section for authenticated users
 * - 'saved': Show saved payment method form (CVV entry)
 * - 'selection': Show payment method buttons (Apple Pay, Google Pay, PayPal, Credit Card)
 * - 'creditCard': Show full credit card form
 */
type VisibleSection = 'creditCard' | 'saved' | 'selection';

export default function PaymentMethodSelector({
  checkoutData,
  hidePricingCard = false,
  isLeadResubmissionFlow: isLeadResubmissionFlowOverride,
  onLoginSuccess,
  onPaymentSuccess,
  selectedPurchasableId,
  skipTermsValidation = false,
  variant = 'light',
}: PaymentMethodSelectorProps) {
  const sessionContext = useSessionContext();
  const flags = useFlags();

  // Use override if provided, otherwise fall back to session context
  const isLeadResubmissionFlow =
    isLeadResubmissionFlowOverride ?? sessionContext.isLeadResubmissionFlow;

  // Get purchase retry flag (ECOMM-587)
  const isRetryEnabled = flags[FLAGS.ECOMM_587_PURCHASE_RETRY] ?? false;

  const [termsAccepted, setTermsAccepted] = useState(skipTermsValidation);
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  const [paymentError, setPaymentError] = useState<null | string>(null);
  const [isApplePayReady, setIsApplePayReady] = useState(false);
  const [isGooglePayReady, setIsGooglePayReady] = useState(false);

  // Pre-initialize Braintree client (singleton) for Apple Pay gesture compliance
  const { client: braintreeClient, isLoading: isBraintreeLoading } = useBraintreeClient();

  // Pre-initialize Apple Pay instance for synchronous session creation
  const applePayInstanceRef = useRef<braintree.ApplePay | null>(null);

  // Pre-initialize Google Pay instances for faster UX
  const googlePayInstanceRef = useRef<braintree.GooglePayment | null>(null);
  const googlePayClientRef = useRef<google.payments.api.PaymentsClient | null>(null);

  useEffect(() => {
    if (!braintreeClient) return;

    let mounted = true;

    const initializeApplePay = async () => {
      try {
        const instance = await initApplePay(braintreeClient);
        if (mounted) {
          if (instance) {
            applePayInstanceRef.current = instance;
          }
          // Always mark ready when init completes - button shows error on click if unavailable
          setIsApplePayReady(true);
        }
      } catch {
        // Apple Pay not available - will show error when user tries to use it
        if (mounted) {
          setIsApplePayReady(true); // Mark as "ready" so button isn't stuck loading
        }
      }
    };

    const initializeGooglePay = async () => {
      try {
        const result = await initGooglePay(braintreeClient);
        if (mounted) {
          googlePayInstanceRef.current = result.googlePayInstance;
          googlePayClientRef.current = result.googlePayClient;
          setIsGooglePayReady(true);
        }
      } catch {
        // Google Pay not available - will show error when user tries to use it
        if (mounted) {
          setIsGooglePayReady(true); // Mark as "ready" so button isn't stuck loading
        }
      }
    };

    void initializeApplePay();
    void initializeGooglePay();

    return () => {
      mounted = false;
    };
  }, [braintreeClient]);

  // Track which payment section is visible (for authenticated users)
  // Uses visibility toggling instead of conditional rendering to avoid
  // re-initializing Braintree/PayPal when switching between payment methods
  // Defaults to 'saved' if user has a valid saved payment method
  const [visibleSection, setVisibleSection] = useState<VisibleSection>(() =>
    getInitialVisibleSection(checkoutData)
  );

  // Track previous typename to detect signin transitions
  const prevTypenameRef = useRef(checkoutData.__typename);

  // Update visible section when user signs in and has a saved payment method
  // This handles the case where checkoutData changes from guest to authenticated
  useEffect(() => {
    const wasGuest = prevTypenameRef.current === 'CheckoutReadyForGuest';
    const isNowAuthenticated = checkoutData.__typename === 'CheckoutReadyForAuthenticatedUser';

    // If user just signed in, show saved payment method if available
    if (wasGuest && isNowAuthenticated) {
      const newSection = getInitialVisibleSection(checkoutData);
      setVisibleSection(newSection);
    }

    prevTypenameRef.current = checkoutData.__typename;
  }, [checkoutData]);

  // Determine checkout state
  const isGuest = checkoutData.__typename === 'CheckoutReadyForGuest';

  // Get saved payment method, but ignore if expired
  const rawSavedPaymentMethod =
    checkoutData.__typename === 'CheckoutReadyForAuthenticatedUser'
      ? checkoutData.savedPaymentMethod
      : null;

  // Check if card is expired (format: "MM/YY")
  const savedPaymentMethod = useMemo(() => {
    if (!rawSavedPaymentMethod?.expirationDate) return rawSavedPaymentMethod;

    const [month, year] = rawSavedPaymentMethod.expirationDate.split('/');
    if (!month || !year) return rawSavedPaymentMethod;

    // Parse expiration (cards expire at the END of the month)
    const expMonth = parseInt(month, 10);
    const expYear = parseInt(year, 10) + 2000; // Convert YY to YYYY

    const now = new Date();
    const currentMonth = now.getMonth() + 1; // JS months are 0-indexed
    const currentYear = now.getFullYear();

    // Card is expired if we're past the expiration month
    const isExpired = currentYear > expYear || (currentYear === expYear && currentMonth > expMonth);

    // Return null if expired (will show payment selection instead)
    return isExpired ? null : rawSavedPaymentMethod;
  }, [rawSavedPaymentMethod]);

  // Determine if we should render authenticated payment sections
  // (uses visibility toggling to avoid re-initializing payment SDKs)
  const isAuthenticated =
    checkoutData.__typename === 'CheckoutReady' ||
    checkoutData.__typename === 'CheckoutReadyForAuthenticatedUser';

  // Get the effective purchasable (selected plan or default)
  // Uses centralized logic from utils to ensure consistency across all payment methods
  const purchasable = useMemo(
    () => getEffectivePurchasable({ checkoutData, selectedPurchasableId }),
    [checkoutData, selectedPurchasableId]
  );

  // Check if saved payment method can be used:
  // - User must be authenticated with a saved payment method
  // - Card must not be expired
  // - Must NOT be a package purchase (backend does not support saved payments for packages)
  const canUseSavedPayment =
    checkoutData.__typename === 'CheckoutReadyForAuthenticatedUser' &&
    savedPaymentMethod !== null &&
    !purchasable?.isPackage &&
    !purchasable?.hasInstallments;

  if (!purchasable) {
    return <div className="text-red-600">No product information available</div>;
  }

  // Handler functions
  const handleSignInSuccess = (userID: string) => {
    console.log('✅ Sign in successful, userID:', userID);

    // Notify parent to refetch checkout data
    if (onLoginSuccess) {
      onLoginSuccess();
    }
  };

  // Helper to handle successful payment
  const handlePaymentResult = (result: PurchaseResult, paymentMethod: PaymentMethod) => {
    // Reset processing state before handling success
    setIsProcessingPayment(false);

    if (onPaymentSuccess) {
      // Let parent handle success (e.g., show modal)
      onPaymentSuccess(result, paymentMethod);
    } else if (result.destinationPath) {
      // Default: redirect directly
      window.location.href = getRedirectUrl(result.destinationPath);
    }
  };

  const handleSavedPaymentComplete = async (nonce: string): Promise<void> => {
    const termsResult = validateTermsAccepted(skipTermsValidation, termsAccepted);
    if ('error' in termsResult) {
      setPaymentError(termsResult.error);
      return;
    }

    if (!savedPaymentMethod) {
      setPaymentError('Saved payment method not available');
      return;
    }

    try {
      setIsProcessingPayment(true);
      setPaymentError(null);

      const recaptchaToken = await getRecaptchaToken();

      const args = buildPurchaseArgs({
        checkoutData,
        clientID: sessionContext.clientID,
        isLeadResubmissionFlow,
        isRetryEnabled,
        promoCode: sessionContext.promoCode,
        purchasableID: sessionContext.purchasableID,
        purchasableType: sessionContext.purchasableType,
        purchaseData: {
          nonce,
          paymentMethod: 'CREDIT_CARD',
          savedPaymentMethodId: savedPaymentMethod.id,
        },
        recaptchaToken,
        selectedPurchasableId,
      });

      const result = await purchaseMembership(args);
      handlePaymentResult(result, 'saved_credit_card');
    } catch (error) {
      console.error('❌ Saved payment failed:', error);
      setPaymentError(getErrorMessage(error));
      setIsProcessingPayment(false);
    }
  };

  // Apple Pay handler - MUST be synchronous to satisfy gesture requirements
  // ApplePaySession must be created immediately within the click handler
  const handleApplePay = () => {
    setPaymentError(null);
    const termsResult = validateTermsAccepted(skipTermsValidation, termsAccepted);
    if ('error' in termsResult) {
      setPaymentError(termsResult.error);
      return;
    }

    const applePayInstance = applePayInstanceRef.current;

    if (!applePayInstance) {
      setPaymentError(
        'Apple Pay is not available. Make sure you have Apple Pay set up in your Wallet.'
      );
      return;
    }

    if (!purchasable) {
      setPaymentError('Product information not available');
      return;
    }

    if (!window.ApplePaySession) {
      setPaymentError('ApplePaySession not available - Chrome support needs investigation');
      return;
    }

    // IMPORTANT: Create payment request and session SYNCHRONOUSLY
    // Any async operations before this point would break the gesture chain
    const currencyCode = purchasable.currencyCode || 'USD';
    const countryCode = getCountryFromCurrency(currencyCode);

    // For packages with installments, charge first installment today
    // Otherwise, use full price (for one-time packages and memberships)
    const paymentAmountCents =
      purchasable.hasInstallments && purchasable.firstInstallmentCents
        ? purchasable.firstInstallmentCents
        : purchasable.priceCents;
    const paymentAmount = (paymentAmountCents / 100).toFixed(2);
    const paymentName = purchasable.name || 'Varsity Tutors';

    const paymentRequest = applePayInstance.createPaymentRequest({
      countryCode,
      currencyCode,
      requiredBillingContactFields: ['postalAddress', 'name'],
      requiredShippingContactFields: ['email'],
      total: {
        amount: paymentAmount,
        label: paymentName,
      },
    }) as ExtendedApplePayPaymentRequest;

    // Set up recurring payment request for subscriptions and package installments
    // This displays the merchant logo and payment description in the Apple Pay sheet
    const isOneTimePackagePayment = purchasable.isPackage && purchasable.numberOfPayments === 1;
    if (!isOneTimePackagePayment) {
      const paymentDescription = purchasable.isPackage
        ? `${paymentName} - installments of ${purchasable.firstInstallment} and ${purchasable.secondInstallment}`
        : `${paymentName} monthly subscription`;

      paymentRequest.recurringPaymentRequest = {
        managementURL: 'https://account.varsitytutors.com/client',
        paymentDescription,
        regularBilling: {
          amount: paymentAmount,
          label: paymentName,
          paymentTiming: 'recurring',
          type: 'final',
        },
      };
    }

    const session = new window.ApplePaySession(3, paymentRequest);

    // Set processing state after session is created
    setIsProcessingPayment(true);

    session.onvalidatemerchant = async (event) => {
      try {
        const merchantSession = await applePayInstance.performValidation({
          displayName: 'Varsity Tutors',
          validationURL: event.validationURL,
        });
        session.completeMerchantValidation(merchantSession);
      } catch (error) {
        session.abort();
        console.error('❌ Apple Pay merchant validation failed:', error);
        setPaymentError(getErrorMessage(error));
        setIsProcessingPayment(false);
      }
    };

    session.onpaymentauthorized = async (event) => {
      try {
        const billingContact = event.payment.billingContact;
        const shippingContact = event.payment.shippingContact;

        if (
          !billingContact?.givenName ||
          !billingContact?.familyName ||
          !billingContact?.postalCode ||
          !shippingContact?.emailAddress
        ) {
          throw new Error('Required payment information is missing');
        }

        const { nonce } = await applePayInstance.tokenize({ token: event.payment.token });
        const recaptchaToken = await getRecaptchaToken();

        const args = buildPurchaseArgs({
          checkoutData,
          clientID: sessionContext.clientID,
          isLeadResubmissionFlow,
          isRetryEnabled,
          promoCode: sessionContext.promoCode,
          purchasableID: sessionContext.purchasableID,
          purchasableType: sessionContext.purchasableType,
          purchaseData: {
            email: shippingContact.emailAddress!,
            firstName: billingContact.givenName!.trim(),
            lastName: billingContact.familyName!.trim(),
            nonce,
            paymentMethod: 'APPLE_PAY',
            zipCode: billingContact.postalCode!.trim(),
          },
          recaptchaToken,
          selectedPurchasableId,
        });

        const result = await purchaseMembership(args);
        session.completePayment(window.ApplePaySession!.STATUS_SUCCESS);
        handlePaymentResult(result, 'apple_pay');
      } catch (error) {
        session.completePayment(window.ApplePaySession!.STATUS_FAILURE);
        console.error('❌ Apple Pay payment failed:', error);
        setPaymentError(getErrorMessage(error));
        setIsProcessingPayment(false);
      }
    };

    session.oncancel = () => {
      trackErrorWithContext(new UserBehaviorError('User canceled Apple Pay payment'));
      setIsProcessingPayment(false);
    };

    session.begin();
  };

  const handleGooglePay = async () => {
    setPaymentError(null);
    const termsResult = validateTermsAccepted(skipTermsValidation, termsAccepted);
    if ('error' in termsResult) {
      setPaymentError(termsResult.error);
      return;
    }

    const googlePayInstance = googlePayInstanceRef.current;
    const googlePayClient = googlePayClientRef.current;

    if (!googlePayInstance || !googlePayClient) {
      setPaymentError('Google Pay is not available on this device or browser');
      return;
    }

    if (!purchasable) {
      setPaymentError('Product information not available');
      return;
    }

    try {
      setIsProcessingPayment(true);

      // For packages with installments, charge first installment today
      // Otherwise, use full price (for one-time packages and memberships)
      const paymentAmountCents =
        purchasable.hasInstallments && purchasable.firstInstallmentCents
          ? purchasable.firstInstallmentCents
          : purchasable.priceCents;

      const paymentDataRequest = googlePayInstance.createPaymentDataRequest({
        emailRequired: true,
        transactionInfo: {
          currencyCode: purchasable.currencyCode || 'USD',
          totalPrice: (paymentAmountCents / 100).toFixed(2),
          totalPriceStatus: 'FINAL',
        },
      });

      paymentDataRequest.allowedPaymentMethods[0].parameters.billingAddressParameters = {
        format: 'MIN',
        phoneNumberRequired: false,
      };
      paymentDataRequest.allowedPaymentMethods[0].parameters.billingAddressRequired = true;

      const paymentData = await googlePayClient.loadPaymentData(paymentDataRequest);
      const { nonce } = await googlePayInstance.parseResponse(paymentData);

      if (
        !paymentData.email ||
        !paymentData.paymentMethodData.info?.billingAddress?.name ||
        !paymentData.paymentMethodData.info?.billingAddress?.postalCode
      ) {
        throw new Error('Required payment information is missing. Please try again.');
      }

      const cardInfo = paymentData.paymentMethodData.info;
      const billingAddress = cardInfo.billingAddress!;
      const nameParts = billingAddress.name!.split(' ');
      const firstName = nameParts[0];
      const lastName = nameParts.slice(1).join(' ') || firstName;

      const recaptchaToken = await getRecaptchaToken();

      const args = buildPurchaseArgs({
        checkoutData,
        clientID: sessionContext.clientID,
        isLeadResubmissionFlow,
        isRetryEnabled,
        promoCode: sessionContext.promoCode,
        purchasableID: sessionContext.purchasableID,
        purchasableType: sessionContext.purchasableType,
        purchaseData: {
          email: paymentData.email!,
          firstName: firstName!,
          lastName: lastName!,
          nonce,
          paymentMethod: 'GOOGLE_PAY',
          zipCode: billingAddress.postalCode!,
        },
        recaptchaToken,
        selectedPurchasableId,
      });

      const result = await purchaseMembership(args);
      handlePaymentResult(result, 'google_pay');
    } catch (error) {
      console.error('❌ Google Pay failed - Full error object:', error);
      if ((error as unknown as GooglePayError).statusCode === 'CANCELED') {
        trackErrorWithContext(new UserBehaviorError('User canceled Google Pay payment'));
      } else {
        setPaymentError(getErrorMessage(error));
      }
      setIsProcessingPayment(false);
    }
  };

  const handlePayPalComplete = async (
    nonce: string,
    details: { email: string; firstName: string; lastName: string; zipCode: string }
  ) => {
    try {
      setIsProcessingPayment(true);
      setPaymentError(null);

      const recaptchaToken = await getRecaptchaToken();

      const args = buildPurchaseArgs({
        checkoutData,
        clientID: sessionContext.clientID,
        isLeadResubmissionFlow,
        isRetryEnabled,
        promoCode: sessionContext.promoCode,
        purchasableID: sessionContext.purchasableID,
        purchasableType: sessionContext.purchasableType,
        purchaseData: {
          email: details.email,
          firstName: details.firstName,
          lastName: details.lastName,
          nonce,
          paymentMethod: 'PAYPAL',
          zipCode: details.zipCode,
        },
        recaptchaToken,
        selectedPurchasableId,
      });

      const result = await purchaseMembership(args);
      handlePaymentResult(result, 'paypal');
    } catch (error) {
      console.error('❌ PayPal payment failed:', error);
      setPaymentError(getErrorMessage(error));
      setIsProcessingPayment(false);
    }
  };

  const handleCreditCard = () => {
    setPaymentError(null);
    const termsResult = validateTermsAccepted(skipTermsValidation, termsAccepted);
    if ('error' in termsResult) {
      setPaymentError(termsResult.error);
      return;
    }
    setVisibleSection('creditCard');
  };

  const handleCreditCardComplete = async (nonce: string, formData: CreditCardFormData) => {
    setPaymentError(null);
    try {
      setIsProcessingPayment(true);

      const recaptchaToken = await getRecaptchaToken();

      const args = buildPurchaseArgs({
        checkoutData,
        clientID: sessionContext.clientID,
        isLeadResubmissionFlow,
        isRetryEnabled,
        promoCode: sessionContext.promoCode,
        purchasableID: sessionContext.purchasableID,
        purchasableType: sessionContext.purchasableType,
        purchaseData: {
          email: formData.email,
          firstName: formData.firstName,
          lastName: formData.lastName,
          nonce,
          paymentMethod: 'CREDIT_CARD',
          zipCode: formData.postalCode,
        },
        recaptchaToken,
        selectedPurchasableId,
      });

      const result = await purchaseMembership(args);
      handlePaymentResult(result, 'credit_card');
    } catch (error) {
      console.error('❌ Payment failed:', error);
      setPaymentError(getErrorMessage(error));
      setIsProcessingPayment(false);
    }
  };

  const overlayStyles = processingOverlayStyles[variant];

  return (
    <>
      {isProcessingPayment && (
        <div className="fixed inset-0 z-[9999] flex cursor-wait items-center justify-center bg-black/50">
          <div className={overlayStyles.container}>
            <Spinner className="mx-auto" theme={variant} />
            <p className={overlayStyles.text}>Processing payment...</p>
          </div>
        </div>
      )}

      <div className="space-y-6" id="Checkout-Form">
        {!hidePricingCard && (
          <PricingCard
            currencyCode={purchasable.currencyCode}
            discountLabel={purchasable.discountLabel}
            entitledHours={purchasable.entitledHours}
            firstInstallment={purchasable.firstInstallment}
            hasInstallments={purchasable.hasInstallments}
            isPackage={purchasable.isPackage}
            oldPriceCents={purchasable.oldPriceCents}
            priceCents={purchasable.priceCents}
            secondInstallment={purchasable.secondInstallment}
          />
        )}

        {!skipTermsValidation && (
          <TermsCheckbox
            checked={termsAccepted}
            onChange={(checked) => {
              setTermsAccepted(checked);
              if (checked && paymentError === 'Please accept the terms and conditions') {
                setPaymentError(null);
              }
            }}
          />
        )}

        {paymentError && (
          <ErrorMessage className="w-full max-w-[400px] p-4" theme={variant}>
            {paymentError}
          </ErrorMessage>
        )}

        {/* State 1: Guest Sign In - conditionally rendered (no payment init for guests) */}
        {isGuest && <GuestSignIn onSignInSuccess={handleSignInSuccess} variant={variant} />}

        {/* 
          Authenticated Payment Sections - Visibility Toggling
          
          All sections are rendered together but only one is visible at a time.
          This avoids re-initializing Braintree and PayPal SDKs when switching
          between payment methods, resulting in:
          - Fewer network requests
          - Instant switching between payment methods
          - Better user experience
        */}
        {isAuthenticated && purchasable && (
          <>
            {/* State 2: Saved Payment Method */}
            {canUseSavedPayment && savedPaymentMethod && (
              <div className={visibleSection === 'saved' ? '' : 'hidden'}>
                <SavedPaymentMethodForm
                  isVisible={visibleSection === 'saved'}
                  onComplete={handleSavedPaymentComplete}
                  onUseDifferentMethod={() => setVisibleSection('selection')}
                  savedPaymentMethod={savedPaymentMethod}
                  variant={variant}
                />
              </div>
            )}

            {/* State 3: Payment Method Selection */}
            <div className={visibleSection === 'selection' ? '' : 'hidden'}>
              <PaymentMethodSelection
                amount={(
                  (purchasable.hasInstallments && purchasable.firstInstallmentCents
                    ? purchasable.firstInstallmentCents
                    : purchasable.priceCents) / 100
                ).toFixed(2)}
                currencyCode={purchasable.currencyCode}
                isApplePayInitializing={isBraintreeLoading || !isApplePayReady}
                isGooglePayInitializing={isBraintreeLoading || !isGooglePayReady}
                isVisible={visibleSection === 'selection'}
                onPayPalCancel={() => console.log('PayPal cancelled')}
                onPayPalComplete={handlePayPalComplete}
                onPayPalError={(error) => setPaymentError(getErrorMessage(error))}
                onSelectApplePay={handleApplePay}
                onSelectCreditCard={handleCreditCard}
                onSelectGooglePay={handleGooglePay}
                onUseSavedPayment={
                  canUseSavedPayment ? () => setVisibleSection('saved') : undefined
                }
                savedPaymentMethod={savedPaymentMethod ?? undefined}
                skipTermsValidation={skipTermsValidation}
                variant={variant}
              />
            </div>

            {/* State 4: Credit Card Form */}
            <div className={visibleSection === 'creditCard' ? '' : 'hidden'}>
              <CreditCardForm
                isVisible={visibleSection === 'creditCard'}
                onBack={() => setVisibleSection('selection')}
                onComplete={handleCreditCardComplete}
                variant={variant}
              />
            </div>
          </>
        )}
      </div>

      <RecaptchaNotice variant={variant} />
    </>
  );
}

function getErrorMessage(error: unknown): string {
  // Handle known payment errors with specific messages
  if (error instanceof PaymentError && error.context?.errorCode) {
    const errorCode = error.context.errorCode as string;
    if (errorCode in CHECKOUT_ERROR_MESSAGES) {
      return CHECKOUT_ERROR_MESSAGES[errorCode as CheckoutErrorCode];
    }
  }

  // Get the raw error message
  const rawMessage = error instanceof Error ? error.message : '';

  // Check for technical error patterns that shouldn't be shown to users
  const technicalErrorPatterns = [
    /text\/html/i, // API returned HTML instead of JSON
    /status:\s*5\d{2}/i, // 5xx server errors
    /status:\s*4\d{2}/i, // 4xx client errors (except user-facing ones)
    /network/i, // Network errors
    /timeout/i, // Timeout errors
    /fetch/i, // Fetch errors
    /ECONNREFUSED/i, // Connection refused
    /ENOTFOUND/i, // DNS errors
    /JSON/i, // JSON parsing errors
  ];

  const isTechnicalError = technicalErrorPatterns.some((pattern) => pattern.test(rawMessage));

  if (isTechnicalError || !rawMessage) {
    return CHECKOUT_ERROR_MESSAGES.UNKNOWN_API_ERROR;
  }

  return rawMessage;
}

function getInitialVisibleSection(data: CheckoutDetailsResponse): VisibleSection {
  if (data.__typename !== 'CheckoutReadyForAuthenticatedUser') return 'selection';
  const saved = data.savedPaymentMethod;
  if (!saved || isCardExpired(saved.expirationDate)) return 'selection';

  // Saved payment methods are NOT supported for package purchases (backend limitation)
  const purchasable = data.purchasable;
  if (purchasable?.isPackage || purchasable?.hasInstallments) return 'selection';

  return 'saved';
}
