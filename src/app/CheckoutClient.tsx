'use client';

/**
 * Client-side checkout component
 * Handles all payment methods and checkout flow
 */

import { useLDClient } from 'launchdarkly-react-client-sdk';
import { useEffect, useRef, useState } from 'react';

import type { CheckoutDetailsResponse } from '@/lib/api/checkout-details';
import type { PurchaseResult } from '@/lib/payment/types';

import {
  trackCheckoutCompletionRouting,
  trackCheckoutStarted,
  trackExperimentPageView,
  trackExperimentPurchase,
  trackPlanPreselected,
  trackPurchaseEvent,
  trackUserLogin,
} from '@/lib/analytics';
import { checkoutDetails } from '@/lib/api/checkout-details';
import { useSessionContext } from '@/lib/context/SessionContextProvider';
import { identifyUserToLaunchDarkly } from '@/lib/flags/identify-user';
import { getRedirectUrl } from '@/lib/utils/checkout-helpers';

import CheckoutLayout from './components/checkout/CheckoutLayout';
import CheckoutNotReadyContent from './components/checkout/CheckoutNotReadyContent';
import PaymentMethodSelector from './components/checkout/PaymentMethodSelector';

interface CheckoutClientProps {
  initialData: CheckoutDetailsResponse;
}

export default function CheckoutClient({ initialData }: CheckoutClientProps) {
  const sessionContext = useSessionContext();
  const ldClient = useLDClient();

  const [checkoutData, setCheckoutData] = useState<CheckoutDetailsResponse>(initialData);
  const [error, setError] = useState<null | string>(null);

  // Track checkout started on initial load (with ref guard to prevent double-firing in Strict Mode)
  const checkoutStartedRef = useRef(false);
  useEffect(() => {
    if (checkoutStartedRef.current) return;
    checkoutStartedRef.current = true;

    // Determine payment method availability based on checkout data
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
        isLeadResubmissionFlow: sessionContext.isLeadResubmissionFlow,
        isPackage: purchasable?.isPackage ?? false,
        promoCode: sessionContext.promoCode,
      }
    );

    if (purchasable) {
      trackPlanPreselected(
        purchasable.id,
        purchasable.name || 'Standard',
        purchasable.priceCents,
        purchasable.entitledHours || 0,
        {
          plan_currency: purchasable.currencyCode,
          plan_original_price: purchasable.oldPriceCents,
        }
      );
    }

    trackExperimentPageView('unset');
  }, [initialData, sessionContext.isLeadResubmissionFlow, sessionContext.promoCode]);

  // Function to refetch checkout data (used after login)
  const refetchCheckoutData = async () => {
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

      // Track successful login with user identification
      const userId =
        data.__typename === 'CheckoutReadyForAuthenticatedUser' ||
        data.__typename === 'CheckoutReady'
          ? data.buyer?.id
          : null;
      trackUserLogin('regular_checkout', userId);
    } catch (err) {
      console.error('Failed to refetch checkout data:', err);
      setError(err instanceof Error ? err.message : 'Failed to load checkout');
    }
  };

  const handlePaymentSuccess = (
    result: PurchaseResult,
    paymentMethod: 'apple_pay' | 'credit_card' | 'google_pay' | 'paypal' | 'saved_credit_card'
  ) => {
    const hasSavedPayment =
      checkoutData.__typename === 'CheckoutReadyForAuthenticatedUser' &&
      !!checkoutData.savedPaymentMethod;

    const purchasable =
      checkoutData.__typename !== 'CheckoutNotReady' ? checkoutData.purchasable : null;

    // Get initial purchasable for preselected plan tracking
    const initialPurchasable =
      initialData.__typename !== 'CheckoutNotReady' ? initialData.purchasable : null;

    void trackPurchaseEvent(
      checkoutData,
      {
        hasApplePay: paymentMethod === 'apple_pay',
        hasCreditCard: paymentMethod === 'credit_card' || paymentMethod === 'saved_credit_card',
        hasGooglePay: paymentMethod === 'google_pay',
        hasPaypal: paymentMethod === 'paypal',
        hasSavedPaymentMethod: hasSavedPayment,
      },
      paymentMethod,
      {
        installmentsCount: purchasable?.numberOfPayments ?? 1,
        isLeadResubmissionFlow: sessionContext.isLeadResubmissionFlow,
        isPackage: purchasable?.isPackage ?? false,
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

    trackExperimentPurchase('unset');

    // Identify user to LaunchDarkly for proper experiment tracking
    void identifyUserToLaunchDarkly(ldClient, result.userUID);

    if (result.destinationPath) {
      const redirectUrl = getRedirectUrl(result.destinationPath);
      trackCheckoutCompletionRouting(redirectUrl);
      window.location.href = redirectUrl;
    }
  };

  // Handle client-side errors within the checkout layout
  if (error) {
    return (
      <CheckoutLayout>
        <CheckoutNotReadyContent message={error} title="Error Loading Checkout" />
      </CheckoutLayout>
    );
  }

  if (!checkoutData) {
    return (
      <CheckoutLayout>
        <CheckoutNotReadyContent
          message="No checkout data available. Please try again."
          title="Checkout Unavailable"
        />
      </CheckoutLayout>
    );
  }

  return (
    <CheckoutLayout>
      <PaymentMethodSelector
        checkoutData={checkoutData}
        onLoginSuccess={refetchCheckoutData}
        onPaymentSuccess={handlePaymentSuccess}
      />
    </CheckoutLayout>
  );
}
