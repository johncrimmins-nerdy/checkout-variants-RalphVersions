import { cookies } from 'next/headers';

import CheckoutNotReadyContent from '@/app/components/checkout/CheckoutNotReadyContent';
import { checkoutDetails, type CheckoutDetailsResponse } from '@/lib/api/checkout-details';
import { fetchQuote, type QuoteResponse } from '@/lib/api/quote';
import { CHECKOUT_ERROR_MESSAGES, getCheckoutErrorInfo } from '@/lib/constants/error-messages';
import { type PersonalizedMessage, SEGMENT_MESSAGES } from '@/lib/constants/retargeting-messages';
import { getFlags } from '@/lib/flags/server';
import { buildSanitizedCookieHeader } from '@/lib/utils/cookie';
import { mergeQuoteWithCheckoutData } from '@/lib/utils/merge-quote-with-purchasable';

import WelcomeBackLayout from './components/WelcomeBackLayout';
import WelcomeBackClient from './WelcomeBackClient';

// Force dynamic rendering to access request cookies
export const dynamic = 'force-dynamic';

// Flag keys matching original checkout-ts implementation
const FLAGS = {
  ECOMM_614_LEAD_RESUBMISSION: 'ECOMM-614-lead-resubmission',
  ECOMM_682_NEW_CHECKOUT_PROMO_CODES: 'ECOMM-682-new-checkout-promo-codes',
  ECOMM_685_AI_PERSONALIZED: 'ECOMM-685-AI-winback-message',
  ECOMM_771_RETARGETING: 'ECOMM-771-retargeting',
  ECOMM_827_CHURNED_CLIENT_PROMOCODE: 'ECOMM-827-churned-client-promocode',
} as const;

/**
 * Seamless Reactivation page - Welcome back flow for returning customers
 * Fetches data server-side for instant rendering
 */
export default async function WelcomeBackPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const params = await searchParams;

  // Get feature flags server-side (reuses singleton LD client)
  const flags = await getFlags();

  // Extract URL parameters server-side (matching original SessionContext)
  const clientID = (params.c as string) ?? undefined;
  const purchasableID = ((params.q as string) || (params.catalogItemId as string)) ?? undefined;
  const purchasableType = params.q ? 'QUOTE' : 'CATALOG_ITEM';
  let promoCode = (params.p as string) ?? undefined;
  const subject = (params.sub as string) ?? undefined;
  const segmentGrade = (params.sg as string) ?? undefined;

  // Check feature flags (matching original checkout-ts logic)
  const leadResubmissionEnabled = (flags[FLAGS.ECOMM_614_LEAD_RESUBMISSION] as boolean) ?? false;
  const promoCodesVariant =
    (flags[FLAGS.ECOMM_682_NEW_CHECKOUT_PROMO_CODES] as string) ?? 'default';
  const churnedClientPromoCode =
    (flags[FLAGS.ECOMM_827_CHURNED_CLIENT_PROMOCODE] as string) ?? 'none';
  const aiPersonalizedEnabled = (flags[FLAGS.ECOMM_685_AI_PERSONALIZED] as boolean) ?? false;
  const retargetingEnabled = (flags[FLAGS.ECOMM_771_RETARGETING] as boolean) ?? false;

  // Detect if this is a lead resubmission flow
  const isLeadResubmission = Boolean(subject && clientID && leadResubmissionEnabled);

  // Auto-apply promo code for churned clients (matching original checkout-ts logic)
  if (isLeadResubmission && !promoCode && churnedClientPromoCode !== 'none') {
    promoCode = churnedClientPromoCode;
  }

  // Determine if we should use promo code (matching original shouldUsePromoCode logic)
  const shouldUsePromoCode =
    purchasableType === 'CATALOG_ITEM' && promoCodesVariant === 'variant' && Boolean(promoCode);

  // Get cookies to pass to API
  // Sanitize cookie values to remove non-ASCII characters (HTTP headers only support 0-255)
  // This prevents "Cannot convert argument to a ByteString" errors when cookie values
  // contain smart quotes or other Unicode characters
  const cookieStore = await cookies();
  const cookieHeader = buildSanitizedCookieHeader(cookieStore.getAll());

  // Server-side data fetching with cookies - wrapped in try-catch for API errors
  let checkoutData: CheckoutDetailsResponse;
  let quoteData: null | QuoteResponse = null;

  try {
    [checkoutData, quoteData] = await Promise.all([
      checkoutDetails(
        {
          clientID,
          isLeadResubmissionFlow: isLeadResubmission,
          promoCode: shouldUsePromoCode ? promoCode : undefined,
          purchasableID,
          purchasableType,
          subject,
          winbackAIEnabled: aiPersonalizedEnabled,
        },
        { cookieHeader }
      ),
      purchasableType === 'QUOTE' && params.q
        ? fetchQuote(params.q as string)
        : Promise.resolve<null | QuoteResponse>(null),
    ]);
  } catch (error) {
    // Handle API errors (invalid catalog item, network errors, etc.)
    const errorObj = error as {
      context?: Record<string, unknown>;
      message?: string;
    };

    console.error('[WelcomeBackPage] Checkout details error:', {
      context: errorObj.context,
      message: errorObj.message,
      purchasableID,
      purchasableType,
    });

    // Parse error to get appropriate message and title
    const errorInfo = getCheckoutErrorInfo(error);

    return (
      <WelcomeBackLayout>
        {/* Match the payment section box styling */}
        <div className="rounded-xl border border-[#6c6e87] bg-[#3f446c] p-6">
          <CheckoutNotReadyContent
            errorDetails={{
              errorCode: errorObj.context?.error_code as string | undefined,
              errorMessage: errorObj.message,
              underlyingError: errorObj.context?.underlying_error as string | undefined,
            }}
            message={errorInfo.message}
            reportToNewRelic={!errorInfo.isKnownError}
            title={errorInfo.title}
            variant="dark"
          />
        </div>
      </WelcomeBackLayout>
    );
  }

  // Check if checkout is ready - show error within the layout
  if (checkoutData.__typename === 'CheckoutNotReady') {
    // Map reason to user-friendly error messages
    let errorMessage = checkoutData.reason || CHECKOUT_ERROR_MESSAGES.UNKNOWN_API_ERROR;
    let errorTitle = 'Unable to Continue';
    let reportToNewRelic = false;

    switch (checkoutData.reason) {
      case 'INVALID_QUOTE':
        errorMessage = CHECKOUT_ERROR_MESSAGES.INVALID_QUOTE;
        errorTitle = 'Invalid Quote';
        break;
      case 'USER_ALREADY_EXISTS':
        errorMessage = CHECKOUT_ERROR_MESSAGES.USER_ALREADY_EXISTS;
        errorTitle = 'Account Already Exists';
        break;
      default:
        // Unknown reason - report to New Relic
        reportToNewRelic = true;
        break;
    }

    return (
      <WelcomeBackLayout>
        {/* Match the payment section box styling */}
        <div className="rounded-xl border border-[#6c6e87] bg-[#3f446c] p-6">
          <CheckoutNotReadyContent
            errorDetails={
              reportToNewRelic
                ? {
                    errorCode: checkoutData.reason,
                    errorMessage: `CheckoutNotReady: ${checkoutData.reason}`,
                  }
                : undefined
            }
            message={errorMessage}
            reportToNewRelic={reportToNewRelic}
            title={errorTitle}
            variant="dark"
          />
        </div>
      </WelcomeBackLayout>
    );
  }

  // Merge quote data with checkout details (only affects purchasable, not options)
  // This happens after CheckoutNotReady check, so data has purchasable/options
  const mergedData = quoteData ? mergeQuoteWithCheckoutData(checkoutData, quoteData) : checkoutData;

  // Determine personalized message (skip for lead resubmission flows)
  let personalizedMessage: PersonalizedMessage | undefined;

  if (!isLeadResubmission) {
    // Priority 1: AI winback message (from API)
    if (
      aiPersonalizedEnabled &&
      (mergedData.__typename === 'CheckoutReady' ||
        mergedData.__typename === 'CheckoutReadyForAuthenticatedUser') &&
      mergedData.winback?.message
    ) {
      personalizedMessage = {
        body: mergedData.winback.message,
        header: mergedData.winback.headline || '',
      };
    }
    // Priority 2: Retargeting message (from segment grade)
    else if (
      retargetingEnabled &&
      purchasableType === 'CATALOG_ITEM' &&
      segmentGrade &&
      SEGMENT_MESSAGES[segmentGrade]
    ) {
      personalizedMessage = SEGMENT_MESSAGES[segmentGrade];
    }
  }

  return (
    <WelcomeBackClient
      initialData={mergedData}
      isLeadResubmission={isLeadResubmission}
      personalizedMessage={personalizedMessage}
    />
  );
}
