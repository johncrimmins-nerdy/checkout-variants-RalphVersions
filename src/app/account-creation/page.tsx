import { Suspense } from 'react';

import AccountCreationClient from './AccountCreationClient';

/**
 * Account Creation Page
 * Allows new customers to create their account after purchase
 */
export default function AccountCreationPage() {
  return (
    <Suspense fallback={null}>
      <AccountCreationClient />
    </Suspense>
  );
}
