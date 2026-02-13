import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

import CheckoutLayout from '@/app/components/checkout/CheckoutLayout';
import CheckoutNotReadyContent from '@/app/components/checkout/CheckoutNotReadyContent';
import { checkoutDetails, type CheckoutDetailsResponse } from '@/lib/api/checkout-details';
import { fetchQuote, type QuoteResponse } from '@/lib/api/quote';
import { CHECKOUT_ERROR_MESSAGES, getCheckoutErrorInfo } from '@/lib/constants/error-messages';
import { CHECKOUT_PAGE_URL, SIGN_IN_PAGE_URL } from '@/lib/constants/urls';
import { buildUrlWithParams } from '@/lib/utils/checkout-helpers';
import { buildSanitizedCookieHeader } from '@/lib/utils/cookie';
import { mergeQuoteWithCheckoutData } from '@/lib/utils/merge-quote-with-purchasable';

import CheckoutClient from './CheckoutClient';

interface CheckoutPageOptions {
  logPrefix: string;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export default async function renderCheckoutPage({ logPrefix, searchParams }: CheckoutPageOptions) {
  const params = await searchParams;

  // Extract URL parameters server-side
  const clientID = getFirstSearchParam(params.c);
  const quoteID = getFirstSearchParam(params.q);
  const catalogItemID = getFirstSearchParam(params.catalogItemId);
  const purchasableID = quoteID || catalogItemID;
  const purchasableType = quoteID ? 'QUOTE' : 'CATALOG_ITEM';
  const promoCode = getFirstSearchParam(params.p);
  const subject = getFirstSearchParam(params.sub);

  // Validate required params early - show error within checkout layout
  if (!purchasableID) {
    return (
      <CheckoutLayout>
        <CheckoutNotReadyContent
          message={CHECKOUT_ERROR_MESSAGES.MISSING_QUOTE_ID_OR_CATALOG_ITEM_ID}
          title="Missing Information"
        />
      </CheckoutLayout>
    );
  }

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
          isLeadResubmissionFlow: false, // Will determine client-side
          promoCode,
          purchasableID,
          purchasableType,
          subject,
        },
        { cookieHeader }
      ),
      purchasableType === 'QUOTE' && quoteID
        ? fetchQuote(quoteID)
        : Promise.resolve<null | QuoteResponse>(null),
    ]);
  } catch (error) {
    // Handle API errors (invalid catalog item, network errors, etc.)
    const errorObj = error as {
      context?: Record<string, unknown>;
      message?: string;
    };

    console.error(`[${logPrefix}] Checkout details error:`, {
      context: errorObj.context,
      message: errorObj.message,
      purchasableID,
      purchasableType,
    });

    // Parse error to get appropriate message and title
    const errorInfo = getCheckoutErrorInfo(error);

    return (
      <CheckoutLayout>
        <CheckoutNotReadyContent
          errorDetails={{
            errorCode: errorObj.context?.error_code as string | undefined,
            errorMessage: errorObj.message,
            underlyingError: errorObj.context?.underlying_error as string | undefined,
          }}
          message={errorInfo.message}
          reportToNewRelic={!errorInfo.isKnownError}
          title={errorInfo.title}
        />
      </CheckoutLayout>
    );
  }

  // Handle CheckoutNotReady scenarios
  if (checkoutData.__typename === 'CheckoutNotReady') {
    // Build current URL for return_to parameter
    const currentUrl = buildUrlWithParams(CHECKOUT_PAGE_URL, params);

    switch (checkoutData.reason) {
      case 'ACCOUNT_MISMATCH':
      case 'AUTHENTICATION_REQUIRED':
        redirect(`${SIGN_IN_PAGE_URL}?return_to=${encodeURIComponent(currentUrl)}`);
        break;

      case 'INVALID_QUOTE':
        return (
          <CheckoutLayout>
            <CheckoutNotReadyContent
              message={CHECKOUT_ERROR_MESSAGES.INVALID_QUOTE}
              title="Invalid Quote"
            />
          </CheckoutLayout>
        );

      case 'USER_ALREADY_EXISTS':
        return (
          <CheckoutLayout>
            <CheckoutNotReadyContent
              message={CHECKOUT_ERROR_MESSAGES.USER_ALREADY_EXISTS}
              title="Account Already Exists"
            />
          </CheckoutLayout>
        );

      default:
        // Unknown reason - report to New Relic
        return (
          <CheckoutLayout>
            <CheckoutNotReadyContent
              errorDetails={{
                errorCode: checkoutData.reason,
                errorMessage: `CheckoutNotReady: ${checkoutData.reason}`,
              }}
              message={checkoutData.reason || CHECKOUT_ERROR_MESSAGES.UNKNOWN_API_ERROR}
              reportToNewRelic
              title="Something went wrong"
            />
          </CheckoutLayout>
        );
    }
  }

  // Merge quote data with checkout details (only affects purchasable, not options)
  // This happens after CheckoutNotReady check, so data has purchasable/options
  const mergedData = quoteData ? mergeQuoteWithCheckoutData(checkoutData, quoteData) : checkoutData;

  return <CheckoutClient initialData={mergedData} />;
}

function getFirstSearchParam(value: string | string[] | undefined): string | undefined {
  if (!value) return undefined;
  return Array.isArray(value) ? value[0] : value;
}
