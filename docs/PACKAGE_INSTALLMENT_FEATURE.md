# Package Quote Installment Feature Report

## Overview

This report analyzes the package quote installment feature from the original Webflow checkout implementation and compares it against the new Next.js implementation.

**Report Date:** November 27, 2025  
**Feature Status:** ✅ **IMPLEMENTED**

---

## Executive Summary

| Aspect | Original | New Implementation |
|--------|----------|-------------------|
| Quote Data Fetching | ✅ REST API `/v1/pricing_quotes/{id}` | ✅ `src/lib/api/quote.ts` |
| Installment Calculation | ✅ Full logic | ✅ `src/lib/utils/installments.ts` |
| Installment UI Display | ✅ Complete | ✅ PricingCard updated |
| Analytics Tracking | ✅ Full data | ✅ Full data passed |
| Package Detection | ✅ Via item_type_id | ✅ `isPackageItem()` |

---

## 1. Original Implementation Deep Dive

### 1.1 Quote Data Model

The original uses a REST API to fetch quote data:

**Endpoint:** `https://{apiDomain}/v1/pricing_quotes/{quoteId}`

**Quote Response Structure:**
```typescript
interface Quote {
  id: string;
  number_of_payments: number;  // KEY FIELD: 1 = one-time, 2 = installments
  customer_first_name?: string;
  customer_last_name?: string;
  items: QuoteItem[];
}

interface QuoteItem {
  item_id: number;
  item_type_id: number;  // Used to detect if it's a package
  name: string;
  currency_code: string;
  list_price_cents: number;    // Original price
  quoted_price_cents: number;  // Final price (after promotions)
  promotions?: QuotePromotion[];
}
```

### 1.2 Package Detection

A quote is classified as a "package" based on:

1. **Production:** `PACKAGE_ITEM_IDS.includes(itemId)` - hardcoded list of package item type IDs
2. **Staging/Dev:** URL contains `?package=true` parameter

```typescript
// From originals/checkout-ts/src/components/shared/services/quote-manager.ts
private isQuotePackage(itemId: number): boolean {
  const isProduction = window.location.hostname.includes('varsitytutors.com');
  const isPackageUrl = window.location.search.includes('package=true');
  return isProduction ? PACKAGE_ITEM_IDS.includes(itemId) : isPackageUrl;
}
```

### 1.3 Installment Calculation Logic

When a quote has `number_of_payments === 2`, installments are calculated (only 2 installments are supported):

```typescript
// From originals/checkout-ts/src/components/shared/services/quote-manager.ts
private getInstallmentPayments(fullPrice: number): [string, string] {
  let firstPayment = '';
  let secondPayment = '';

  // If evenly divisible by 2 (in cents), equal installments
  if (fullPrice % 200 === 0) {
    firstPayment = formatPrice(fullPrice / 2);
    secondPayment = firstPayment;
  }

  // Otherwise, first installment rounds up to nearest dollar
  const first = Math.ceil(fullPrice / 200) * 100;
  firstPayment = formatPrice(first);
  secondPayment = formatPrice(fullPrice - first);

  return [firstPayment, secondPayment];
}
```

**Note:** Only 2 installments are ever supported. No generic N-installment logic is needed.

**Example Calculations (Always 2 Installments):**
| Total Price | First Installment | Second Installment | Notes |
|-------------|-------------------|-------------------|-------|
| $2,000 (200000 cents) | $1,000 | $1,000 | Even split |
| $1,500 (150000 cents) | $750 | $750 | Even split |
| $1,999 (199900 cents) | $1,000 | $999 | First rounds up |
| $2,001 (200100 cents) | $1,001 | $1,000 | First rounds up |

### 1.4 Price Info Extraction

The `extractPriceInfoFromQuote()` method builds a complete `PriceInfo` object:

```typescript
// From originals/checkout-ts/src/components/shared/services/quote-manager.ts
public extractPriceInfoFromQuote(): PriceInfo {
  const firstItem = this._quote?.items?.[0];
  
  const [firstInstallment, secondInstallment] = this.getInstallmentPayments(
    firstItem.quoted_price_cents
  );

  // Payment amount is first installment if >1 payments, otherwise full price
  const paymentAmount = this._quote.number_of_payments > 1
    ? firstInstallment
    : formatPrice(firstItem.quoted_price_cents);

  return {
    currencyCode: firstItem.currency_code ?? 'USD',
    currentPrice: formatPrice(firstItem.quoted_price_cents),
    firstInstallment,
    secondInstallment,
    hasInstallments: this._quote.number_of_payments > 1,
    hasPromotions: /* promotion logic */,
    paymentAmount,
    priceCents: firstItem.quoted_price_cents,
    priceType: this._isPackage ? 'package' : 'membership',
    // ... other fields
  };
}
```

### 1.5 UI Display

The checkout page displays installment information in two places:

**1. Quote Installment Summary** (`.quote-installment`):
```
"2 installments of $1,000"
// OR if amounts differ:
"Installments of $1,001 and $1,000"
```

**2. Installment Details** (`.item-installment-details`):
```
"Your total is $2,000. You'll pay $1,000 today, and then pay $1,000 in 30 days."
```

```typescript
// From originals/checkout-ts/src/components/express-checkout/helpers/update-checkout-ui.ts
if (priceInfo?.priceType === 'package' && priceInfo?.hasInstallments && quoteInstallments) {
  const firstInstallmentValue = `${priceSymbol}${priceInfo.firstInstallment}`;
  const secondInstallmentValue = `${priceSymbol}${priceInfo.secondInstallment}`;

  quoteInstallments.textContent =
    priceInfo.firstInstallment === priceInfo.secondInstallment
      ? `2 installments of ${firstInstallmentValue}`
      : `Installments of ${firstInstallmentValue} and ${secondInstallmentValue}`;

  installmentDetails.textContent = 
    `Your total is ${priceSymbol + priceInfo.currentPrice}. ` +
    `You'll pay ${firstInstallmentValue} today, and then ` +
    `pay ${secondInstallmentValue} in 30 days.`;
}
```

### 1.6 Quote Page Display

On quote selection pages (`/checkout/quotepage/*`), packages show:

- Package title and hours
- Total price
- Hourly rate (if applicable)
- **Installment breakdown** (number of installments × amount)
- Discount/promo information

DOM Selectors used:
- `[data-vt="pkg-details"]` - Package details container
- `[data-vt="pkg-installments"]` - Installment information
- `[data-vt="pkg-total-with-discount"]` / `[data-vt="pkg-total-no-discount"]`

### 1.7 Analytics Tracking

Package/installment data is tracked in checkout events:

```typescript
// From checkout-data-object.ts
{
  billing_interval: 'installments' | 'one_time' | 'monthly',
  has_installments: boolean,
  installments_count: number,
  is_package: boolean,
  // ...
}
```

**Billing Interval Logic:**
- For packages with >1 payment: `'installments'`
- For packages with 1 payment: `'one_time'`
- For memberships: `'monthly'`

### 1.8 E2E Test Coverage

The feature has dedicated E2E test coverage:

```typescript
// e2e-tests/package-quote-checkout-installment.spec.ts
// Tests:
// - Quote page pricing extraction
// - Installment display validation
// - Price consistency between quote page and checkout
// - Multiple package purchase flow
```

---

## 2. New Implementation Status

### 2.1 What's Implemented ✅

| Component | File | Status |
|-----------|------|--------|
| **Quote API Integration** | `src/lib/api/quote.ts` | ✅ `fetchQuote()` |
| **Installment Calculation** | `src/lib/utils/installments.ts` | ✅ `calculateInstallments()` |
| **Merge Utility** | `src/lib/utils/merge-quote-with-purchasable.ts` | ✅ Purchasable-only merge |
| **Package Detection** | `src/lib/api/quote.ts` | ✅ `isPackageItem()` |
| **Extended Purchasable** | `src/lib/api/checkout-details.ts` | ✅ Installment fields added |
| **UI: Installment Display** | `src/app/components/checkout/PricingCard.tsx` | ✅ Both themes |
| **Analytics Tracking** | `src/lib/analytics/checkout-tracking.ts` | ✅ Full data |
| **Quote Pages** | N/A | ⏸️ On Hold |

### 2.2 New Files Created

**`src/lib/api/quote.ts`** - Quote REST API fetching:
```typescript
export async function fetchQuote(quoteId: string): Promise<QuoteResponse> {
  // Fetches from /v1/pricing_quotes/{quoteId}
  // Returns hasInstallments, isPackage, numberOfPayments
}
```

**`src/lib/utils/installments.ts`** - Installment calculation:
```typescript
export function calculateInstallments(priceCents: number, numberOfPayments: number): InstallmentBreakdown {
  // Only 2 installments supported
  // Returns firstInstallment, secondInstallment, hasInstallments
}
```

**`src/lib/utils/merge-quote-with-purchasable.ts`** - Data merging:
```typescript
export function mergeQuoteWithCheckoutData<T>(checkoutData: T, quoteData: QuoteResponse | null): T {
  // Merges installment data with purchasable only
  // Options array remains unchanged
}
```

### 2.3 Integration Flow

1. **Server-side** (`page.tsx`):
   - Check if `?q=` param present (quote-based checkout)
   - Fetch quote data from REST API
   - Merge with GraphQL checkout details
   - Pass merged data to client

2. **Client-side**:
   - `PricingCard` receives installment props
   - Shows "2 installments of $X" summary
   - Shows "Your total is $X. You'll pay $Y today..." details
   - Analytics tracking includes installment data

---

## 3. PricingCard Component (Updated)

### 3.1 Current Props ✅

```typescript
interface PricingCardProps {
  cardLabel?: string;
  currencyCode?: string;
  discountLabel?: string;
  entitledHours: number;
  firstInstallment?: string;        // ✅ Added
  hasInstallments?: boolean;        // ✅ Added
  isPackage?: boolean;              // ✅ Added
  oldPriceCents?: number;
  onSwitchPlan?: () => void;
  planName?: string;
  priceCents: number;
  secondInstallment?: string;       // ✅ Added
  switcherText?: string;
  variant?: 'dark' | 'dark-inline' | 'light';
}
```

### 3.2 Display Logic ✅

**For Memberships (default):**
- Shows price with `/mo` suffix
- No installment information

**For Packages with Installments:**
- Shows total price (no `/mo` suffix)
- Shows installment summary: "2 installments of $X"
- Shows installment details box: "Your total is $X. You'll pay $Y today..."
- Label changes to "Package details"

**Example Package Display (Light Theme):**
```
Package details
[hours] hours                    [discount] $[totalPrice]
2 installments of $1,000
┌─────────────────────────────────────────────────┐
│ Your total is $2,000. You'll pay $1,000 today,  │
│ and then pay $1,000 in 30 days.                 │
└─────────────────────────────────────────────────┘
```

---

## 4. Implementation Constraints

### 4.1 Business Rules

1. **Maximum 2 Installments Only**
   - The system only supports 2 installments (never more)
   - No need for a generic N-installments approach
   - Simplifies calculation: `firstInstallment` + `secondInstallment` = `totalPrice`

2. **Quotes Only (Not Catalog Items)**
   - Installments only apply to quote-based checkout (`?q=` param present)
   - Catalog item checkout (`?catalogItemId=`) never has installments
   - Detection: `purchasableType === 'QUOTE'` or `searchParams.q` exists

3. **Purchasable Only (Not Options)**
   - Quote data should only be merged with `purchasable` object
   - The `options` array (alternative plans) should NOT include installment data
   - Installments are defined for the specific quoted item, not for switching options

### 4.2 Simplified Logic

Given these constraints, the implementation can be simplified:

```typescript
// Simple installment check
const isQuoteFlow = Boolean(searchParams.q);
const hasInstallments = isQuoteFlow && quoteData.number_of_payments === 2;

// Only merge with purchasable, never options
if (hasInstallments) {
  purchasable = {
    ...purchasable,
    hasInstallments: true,
    firstInstallment: calculateFirstInstallment(purchasable.priceCents),
    secondInstallment: calculateSecondInstallment(purchasable.priceCents),
  };
}
// options remain unchanged - no installment data
```

---

## 5. Recommendations

### 5.1 High Priority (If Quote-Based Checkout is Needed)

1. **Add Quote API Integration**
   - Create `src/lib/api/quote.ts` with REST API fetching
   - Only fetch when `?q=` param is present
   - Handle quote data alongside GraphQL checkout details

2. **Add Installment Calculation**
   - Port `getInstallmentPayments()` to `src/lib/utils/installments.ts`
   - Keep it simple: only 2 installments
   - Use in price info building for `purchasable` only

3. **Update PricingCard Component**
   - Add installment-related props
   - Add installment display UI for packages
   - Only show when `hasInstallments` is true

4. **Update Analytics Tracking**
   - Pass `installmentsCount: 2` (or 1) to tracking
   - Pass `isPackage` flag to tracking

### 5.2 Medium Priority

1. **Package Detection**
   - Port `PACKAGE_ITEM_IDS` constant
   - Implement `isPackage` detection logic

2. **Merge Strategy**
   - Create utility to merge quote data with purchasable
   - Explicitly skip merging with options array

### 5.3 Low Priority (Quote Pages On Hold)

1. **Quote Page Route**
   - Implement `/checkout/quotepage/[...slug]`
   - Build package selection UI
   - Port quote page DOM helpers

---

## 6. Implementation Roadmap

### Phase 1: Core Infrastructure
- [ ] Create `src/lib/api/quote.ts` for quote API
  - Fetch only when `?q=` param present
  - Return `number_of_payments` and package info
- [ ] Create `src/lib/utils/installments.ts`
  - `calculateInstallments(priceCents: number): { first: string; second: string }`
  - Simple 2-installment logic only

### Phase 2: Data Merging
- [ ] Create `mergeQuoteWithPurchasable()` utility
  - Merge installment data with `purchasable` only
  - Never merge with `options` array
  - Add `hasInstallments`, `firstInstallment`, `secondInstallment` to purchasable

### Phase 3: UI Updates
- [ ] Update `PricingCard` props and display
  - Add: `hasInstallments`, `firstInstallment`, `secondInstallment`
  - Conditionally render installment info when `hasInstallments`
- [ ] Add installment details text
  - "2 installments of $X" or "Installments of $X and $Y"
  - "Your total is $Z. You'll pay $X today, and then pay $Y in 30 days."

### Phase 4: Analytics
- [ ] Pass `installmentsCount: 2` when quote has 2 payments
- [ ] Pass `isPackage: true` when detected
- [ ] Verify analytics events include correct data

### Phase 5: Quote Pages (When Prioritized)
- [ ] Implement quote page route
- [ ] Build package selection cards
- [ ] Handle quote-to-checkout navigation

---

## 7. Testing Considerations

### Current E2E Test (Original)
```typescript
// package-quote-checkout-installment.spec.ts
// Tests installment display and price validation
```

### Required Tests (New)
- [ ] Unit tests for `calculateInstallments(priceCents)`
  - Even split case (e.g., $2000 → $1000 + $1000)
  - Uneven split case (e.g., $1999 → $1000 + $999)
- [ ] Unit tests for `mergeQuoteWithPurchasable()`
  - Verify installment data added to purchasable
  - Verify options array unchanged
- [ ] Component tests for PricingCard with installments
  - Renders installment text when `hasInstallments`
  - Hides installment text when `!hasInstallments`
- [ ] Integration tests for quote-based checkout (`?q=`)
  - Quote data fetched and merged correctly
  - Installment UI displays
- [ ] E2E tests matching original coverage

---

## 8. Conclusion

The new implementation has **type infrastructure** for package installments but lacks the **functional implementation**. Users attempting to checkout with package quotes will:

1. ✅ See the total price
2. ❌ NOT see installment breakdown
3. ❌ NOT see "pay today, pay in 30 days" messaging
4. ⚠️ Analytics will track with default values (no installments)

**Recommendation:** If package quote checkout is an active use case, implement the core infrastructure in Phases 1-3 before production launch.

---

## 9. Appendix: File References

### Original Implementation
- `originals/checkout-ts/src/components/shared/services/quote-manager.ts`
- `originals/checkout-ts/src/components/express-checkout/helpers/update-checkout-ui.ts`
- `originals/checkout-ts/src/components/quote-page/init-quote-page.ts`
- `originals/checkout-ts/src/types/price-info.ts`
- `originals/checkout-ts/e2e-tests/package-quote-checkout-installment.spec.ts`

### New Implementation
- `src/types/price-info.ts` - Types defined but not populated
- `src/types/index.ts` - Quote types
- `src/lib/analytics/checkout-tracking.ts` - Analytics logic with defaults
- `src/app/components/checkout/PricingCard.tsx` - Missing installment UI

