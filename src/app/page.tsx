import renderCheckoutPage from './checkout-page';

// Force dynamic rendering to access request cookies
export const dynamic = 'force-dynamic';

/**
 * Checkout page - Express checkout with multiple payment methods
 * Fetches data server-side for instant rendering
 */
export default async function CheckoutPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  return renderCheckoutPage({
    logPrefix: 'CheckoutPage',
    searchParams,
  });
}
