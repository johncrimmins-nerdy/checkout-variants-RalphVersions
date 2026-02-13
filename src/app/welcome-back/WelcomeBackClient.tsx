'use client';

/**
 * Client-side welcome-back component
 * Handles seamless reactivation flow for returning customers
 * Reuses PaymentMethodSelector from checkout with dark variant
 */

import { useLDClient } from 'launchdarkly-react-client-sdk';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import type { CheckoutDetailsResponse } from '@/lib/api/checkout-details';
import type { PersonalizedMessage as PersonalizedMessageType } from '@/lib/constants/retargeting-messages';
import type { PurchaseResult } from '@/lib/payment/types';

import CheckoutNotReadyContent from '@/app/components/checkout/CheckoutNotReadyContent';
import PaymentMethodSelector from '@/app/components/checkout/PaymentMethodSelector';
import PricingCard from '@/app/components/checkout/PricingCard';
import {
  trackCheckoutCompletionRouting,
  trackCheckoutStarted,
  trackPlanSelected,
  trackPurchaseEvent,
  trackUserLogin,
} from '@/lib/analytics';
import { checkoutDetails } from '@/lib/api/checkout-details';
import { useSessionContext } from '@/lib/context/SessionContextProvider';
import { identifyUserToLaunchDarkly } from '@/lib/flags/identify-user';
import { MOST_POPULAR_HOURS } from '@/lib/payment/constants';
import { getEffectivePurchasable } from '@/lib/payment/utils';
import { getRedirectUrl } from '@/lib/utils/checkout-helpers';
import { currencySymbol } from '@/lib/utils/currency-symbol';
import { formatPriceWithCents } from '@/lib/utils/format-price';

import CheckoutCompletedModal from './components/CheckoutCompletedModal';
import WelcomeBackLayout from './components/WelcomeBackLayout';

interface WelcomeBackClientProps {
  initialData: CheckoutDetailsResponse;
  isLeadResubmission: boolean;
  personalizedMessage?: PersonalizedMessageType;
}

export default function WelcomeBackClient({
  initialData,
  isLeadResubmission,
  personalizedMessage,
}: WelcomeBackClientProps) {
  const sessionContext = useSessionContext();
  const ldClient = useLDClient();

  const [checkoutData, setCheckoutData] = useState<CheckoutDetailsResponse>(initialData);
  const [error, setError] = useState<null | string>(null);

  // Modal states
  const [showAuthModal, setShowAuthModal] = useState(
    initialData.__typename === 'CheckoutReadyForAuthenticatedUser'
  );
  const [showLoggedInToast, setShowLoggedInToast] = useState(false);
  const [showCompletedModal, setShowCompletedModal] = useState(false);
  const [redirectUrl, setRedirectUrl] = useState<null | string>(null);

  // Auto-hide auth modal after minimum display time on initial load
  // This handles the case when page loads with authenticated user
  useEffect(() => {
    // Only auto-hide for initially authenticated users when modal is showing
    if (initialData.__typename !== 'CheckoutReadyForAuthenticatedUser') return;
    if (!showAuthModal) return;

    // Show for 1.5 seconds, then hide and show toast
    const timeout = setTimeout(() => {
      setShowAuthModal(false);
      setShowLoggedInToast(true);
    }, 1500);

    return () => clearTimeout(timeout);
  }, [initialData.__typename, showAuthModal]);

  // Auto-hide logged-in toast after 2 seconds
  useEffect(() => {
    if (!showLoggedInToast) return;

    const timeout = setTimeout(() => {
      setShowLoggedInToast(false);
    }, 2000);

    return () => clearTimeout(timeout);
  }, [showLoggedInToast]);

  // Track checkout started on initial load (with ref guard to prevent double-firing in Strict Mode)
  const checkoutStartedRef = useRef(false);
  useEffect(() => {
    if (checkoutStartedRef.current) return;
    checkoutStartedRef.current = true;

    const hasSavedPayment =
      initialData.__typename === 'CheckoutReadyForAuthenticatedUser' &&
      !!initialData.savedPaymentMethod;

    // Get purchasable data for installment tracking
    const purchasable =
      initialData.__typename !== 'CheckoutNotReady' ? initialData.purchasable : null;

    trackCheckoutStarted(
      initialData,
      {
        hasApplePay: typeof window !== 'undefined' && 'ApplePaySession' in window,
        hasCreditCard: true,
        hasGooglePay: typeof window !== 'undefined' && 'google' in window,
        hasPaypal: typeof window !== 'undefined' && 'paypal' in window,
        hasSavedPaymentMethod: hasSavedPayment,
      },
      {
        installmentsCount: purchasable?.numberOfPayments ?? 1,
        isLeadResubmissionFlow: isLeadResubmission,
        isPackage: purchasable?.isPackage ?? false,
        promoCode: sessionContext.promoCode,
      }
    );
  }, [initialData, isLeadResubmission, sessionContext.promoCode]);

  // Plan selection state - track selected purchasable ID for plan switching
  const [selectedPurchasableId, setSelectedPurchasableId] = useState<string | undefined>(
    initialData.__typename !== 'CheckoutNotReady' ? initialData.purchasable?.id : undefined
  );

  const buyerFirstName =
    checkoutData.__typename === 'CheckoutReadyForAuthenticatedUser' ||
    checkoutData.__typename === 'CheckoutReady'
      ? checkoutData.buyer?.firstName
      : undefined;

  // Get purchasable options
  const options = checkoutData.__typename !== 'CheckoutNotReady' ? checkoutData.options : undefined;

  // Get the effective purchasable using centralized utility (single source of truth)
  // This handles: selectedPurchasableId > API purchasable > mostPopular (4hr) > first option
  const selectedPurchasable = useMemo(
    () => getEffectivePurchasable({ checkoutData, selectedPurchasableId }),
    [checkoutData, selectedPurchasableId]
  );

  // === Card Label Logic (from original update-plan-options-ui.ts) ===
  // These values are only used for determining the card label display

  // defaultPurchasable = "lastPurchase" in original (from API, user's previous purchase or URL-specified)
  const defaultPurchasable =
    checkoutData.__typename !== 'CheckoutNotReady' ? checkoutData.purchasable : null;

  // Find the most popular purchasable (4 hours plan)
  const mostPopularPurchasable = useMemo(
    () => options?.find((p) => p.entitledHours === MOST_POPULAR_HOURS),
    [options]
  );

  // Compute the default option (fallback chain for label logic)
  const defaultOption = useMemo(
    () => defaultPurchasable ?? mostPopularPurchasable ?? options?.[0] ?? null,
    [defaultPurchasable, mostPopularPurchasable, options]
  );

  // Get the alternate plan for switching (if available)
  const alternatePlan = useMemo(() => {
    if (!options || options.length <= 1 || !selectedPurchasable) return null;
    return options.find((p) => p.id !== selectedPurchasable.id) || null;
  }, [options, selectedPurchasable]);

  // Generate switcher text based on alternate plan
  const switcherText = useMemo(() => {
    if (!alternatePlan) return undefined;
    const price = formatPriceWithCents(alternatePlan.priceCents);
    const symbol = currencySymbol(alternatePlan.currencyCode);
    return `Switch to ${alternatePlan.entitledHours} hours for ${symbol}${price} per month`;
  }, [alternatePlan]);

  // Determine card label based on checkout type and selected plan
  // Logic from original: update-plan-options-ui.ts
  const cardLabel = useMemo(() => {
    if (!selectedPurchasable) return 'Your Recommended Plan';

    // Original: lastPurchase?.id === selectedPlan.id && selectedPlan.id === defaultOption?.id
    // defaultPurchasable = lastPurchase (user's previous purchase from API)
    const isLastPurchase =
      defaultPurchasable?.id === selectedPurchasable.id &&
      selectedPurchasable.id === defaultOption?.id;

    // Original had urlDefaultOption?.id which tracked URL-specified plans separately.
    // Since we don't have that granularity (defaultPurchasable includes both URL params
    // and last purchases), we simplify to only show "Most Popular" when the 4-hour plan
    // is the current default option.
    const isMostPopular =
      mostPopularPurchasable?.id === selectedPurchasable.id &&
      selectedPurchasable.id === defaultOption?.id;

    if (isLastPurchase) {
      return 'Your Previous Plan';
    } else if (isMostPopular) {
      return 'Most Popular';
    } else {
      return 'Your Recommended Plan';
    }
  }, [selectedPurchasable, defaultPurchasable, defaultOption, mostPopularPurchasable]);

  // Handle plan switch
  const handleSwitchPlan = useCallback(() => {
    if (!alternatePlan) return;

    // Capture current plan before switching for tracking
    const previousPlan = selectedPurchasable
      ? {
          currencyCode: selectedPurchasable.currencyCode,
          entitledHours: selectedPurchasable.entitledHours,
          id: selectedPurchasable.id,
          name: selectedPurchasable.name,
          oldPriceCents: selectedPurchasable.oldPriceCents,
          priceCents: selectedPurchasable.priceCents,
          type: selectedPurchasable.isPackage ? 'package' : 'membership',
        }
      : undefined;

    setSelectedPurchasableId(alternatePlan.id);

    // Track plan selection with previous plan data
    trackPlanSelected(
      alternatePlan.id,
      alternatePlan.name || 'Standard',
      alternatePlan.priceCents / 100,
      alternatePlan.entitledHours || 0,
      {
        currencyCode: alternatePlan.currencyCode,
        oldPriceCents: alternatePlan.oldPriceCents,
        previousPlan,
        type: alternatePlan.isPackage ? 'package' : 'membership',
      }
    );
  }, [alternatePlan, selectedPurchasable]);

  // Refetch checkout data after login
  const refetchCheckoutData = useCallback(async () => {
    try {
      const data = await checkoutDetails({
        clientID: sessionContext.clientID,
        isLeadResubmissionFlow: sessionContext.isLeadResubmissionFlow,
        promoCode: sessionContext.shouldUsePromoCode() ? sessionContext.promoCode : undefined,
        purchasableID: sessionContext.purchasableID,
        purchasableType: sessionContext.purchasableType,
        subject: sessionContext.subject,
      });

      setCheckoutData(data);
      return data;
    } catch (err) {
      console.error('Failed to refetch checkout data:', err);
      setError(err instanceof Error ? err.message : 'Failed to load checkout');
      return null;
    }
  }, [sessionContext]);

  // Handle sign-in success - show toast and refetch data
  const handleSignInSuccess = async () => {
    const data = await refetchCheckoutData();
    if (data?.__typename === 'CheckoutReadyForAuthenticatedUser') {
      // After manual sign-in, just show toast (more subtle)
      setShowLoggedInToast(true);
      // Track successful login with user identification
      trackUserLogin('seamless_reactivation', data.buyer?.id);
    }
  };

  // Handle payment success - show modal instead of redirecting directly
  const handlePaymentSuccess = (
    result: PurchaseResult,
    paymentMethod: 'apple_pay' | 'credit_card' | 'google_pay' | 'paypal' | 'saved_credit_card'
  ) => {
    console.log('✅ Payment successful!', { paymentMethod, result });

    // Track purchase event with installment data
    // Get initial purchasable for preselected plan tracking (default shown on load)
    const initialPurchasable =
      initialData.__typename !== 'CheckoutNotReady' ? initialData.purchasable : null;

    void trackPurchaseEvent(
      checkoutData,
      {
        hasApplePay: paymentMethod === 'apple_pay',
        hasCreditCard: paymentMethod === 'credit_card' || paymentMethod === 'saved_credit_card',
        hasGooglePay: paymentMethod === 'google_pay',
        hasPaypal: paymentMethod === 'paypal',
        hasSavedPaymentMethod: paymentMethod === 'saved_credit_card',
      },
      paymentMethod,
      {
        installmentsCount: selectedPurchasable?.numberOfPayments ?? 1,
        isLeadResubmissionFlow: isLeadResubmission,
        isPackage: selectedPurchasable?.isPackage ?? false,
        paymentId: result.paymentID,
        preselectedPlan: initialPurchasable
          ? {
              currencyCode: initialPurchasable.currencyCode,
              entitledHours: initialPurchasable.entitledHours,
              id: initialPurchasable.id,
              name: initialPurchasable.name,
              oldPriceCents: initialPurchasable.oldPriceCents,
              priceCents: initialPurchasable.priceCents,
              type: initialPurchasable.isPackage ? 'package' : 'membership',
            }
          : undefined,
        promoCode: sessionContext.promoCode,
      }
    );

    // Identify user to LaunchDarkly for proper experiment tracking
    void identifyUserToLaunchDarkly(ldClient, result.userUID);

    // Show completed modal and set redirect URL
    if (result.destinationPath) {
      const url = getRedirectUrl(result.destinationPath);
      trackCheckoutCompletionRouting(url);
      setRedirectUrl(url);
      setShowCompletedModal(true);
    }
  };

  if (error) {
    return (
      <WelcomeBackLayout
        buyerFirstName={buyerFirstName}
        isLeadResubmission={isLeadResubmission}
        personalizedMessage={personalizedMessage}
      >
        {/* Match the payment section box styling */}
        <div className="rounded-xl border border-[#6c6e87] bg-[#3f446c] p-6">
          <CheckoutNotReadyContent message={error} title="Error Loading Checkout" variant="dark" />
        </div>
      </WelcomeBackLayout>
    );
  }

  if (!selectedPurchasable) {
    return (
      <WelcomeBackLayout
        buyerFirstName={buyerFirstName}
        isLeadResubmission={isLeadResubmission}
        personalizedMessage={personalizedMessage}
      >
        {/* Match the payment section box styling */}
        <div className="rounded-xl border border-[#6c6e87] bg-[#3f446c] p-6">
          <CheckoutNotReadyContent
            message="No product information available. Please try again."
            title="Product Unavailable"
            variant="dark"
          />
        </div>
      </WelcomeBackLayout>
    );
  }

  return (
    <WelcomeBackLayout
      buyerFirstName={buyerFirstName}
      isLeadResubmission={isLeadResubmission}
      personalizedMessage={personalizedMessage}
      showAuthModal={showAuthModal}
      showLoggedInToast={showLoggedInToast}
    >
      {/* Checkout Completed Modal */}
      <CheckoutCompletedModal redirectUrl={redirectUrl} visible={showCompletedModal} />

      {/* These elements hide for lead resubmission flow (data-vt="hide-lead-resubmission" in original) */}
      {!isLeadResubmission && (
        <>
          {/* title-md: 1.25rem (20px), font-weight 500 - matches original */}
          <h2 className="mb-1 text-xl font-medium text-white">Lock in your rate today</h2>
          {/* label-md: 0.875rem (14px), font-weight 500 */}
          <p className="mb-4 text-sm font-medium text-white/80">
            Continue your progress with the tutor you already know and trust.
          </p>
        </>
      )}

      {/* Single unified checkout box - matches original luminex card styling */}
      <div className="rounded-xl border border-[#6c6e87] bg-[#3f446c] p-6">
        {/* Pricing Card - inline variant (no box) */}
        <PricingCard
          cardLabel={cardLabel}
          currencyCode={selectedPurchasable.currencyCode}
          discountLabel={selectedPurchasable.discountLabel}
          entitledHours={selectedPurchasable.entitledHours}
          firstInstallment={selectedPurchasable.firstInstallment}
          hasInstallments={selectedPurchasable.hasInstallments}
          isPackage={selectedPurchasable.isPackage}
          oldPriceCents={selectedPurchasable.oldPriceCents}
          onSwitchPlan={alternatePlan ? handleSwitchPlan : undefined}
          planName={selectedPurchasable.name || 'Standard'}
          priceCents={selectedPurchasable.priceCents}
          secondInstallment={selectedPurchasable.secondInstallment}
          switcherText={switcherText}
          variant="dark-inline"
        />

        {/* Reusable PaymentMethodSelector - handles all payment states and methods */}
        <PaymentMethodSelector
          checkoutData={checkoutData}
          hidePricingCard
          isLeadResubmissionFlow={isLeadResubmission}
          onLoginSuccess={handleSignInSuccess}
          onPaymentSuccess={handlePaymentSuccess}
          selectedPurchasableId={selectedPurchasableId}
          skipTermsValidation
          variant="dark"
        />
      </div>
    </WelcomeBackLayout>
  );
}
