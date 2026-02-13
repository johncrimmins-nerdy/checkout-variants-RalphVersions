import renderCheckoutPage from '@/app/checkout-page';

// Force dynamic rendering to access request cookies
export const dynamic = 'force-dynamic';

export default async function QuotelessCheckoutPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  return renderCheckoutPage({
    logPrefix: 'QuotelessCheckoutPage',
    searchParams,
  });
}
