# Migration Gap Analysis Report

## Overview

This report compares the original Webflow checkout implementation (`originals/checkout-ts/`) with the new Next.js implementation (`src/`) to identify gaps and areas requiring attention.

**Report Date:** December 1, 2025  
**Status:** Phase 8 Complete, Phase 9 In Progress  
**E2E Tests:** 35 passing, 1 skipped

---

## Executive Summary

### Migration Progress

| Area | Status | Completeness |
|------|--------|--------------|
| **Checkout Flow** | ✅ Complete | 98% |
| **Seamless Reactivation** | ✅ Complete | 98% |
| **Account Creation** | ✅ Complete | 90% |
| **Quote Pages** | ⏸️ On Hold | N/A |
| **Supporting Pages** | ✅ Complete | 100% |
| **Analytics - VT/Segment** | ✅ Complete | 95% |
| **Analytics - New Relic** | ✅ Complete | 90% |
| **Payment Integration** | ✅ Complete | 98% |
| **Error Handling** | ✅ Complete | 95% |

---

## 1. Pages & Routes

### Implemented ✅

| Route | Original | New | Notes |
|-------|----------|-----|-------|
| `/checkout` | `express-checkout/index.ts` | `src/app/page.tsx` | Fully ported |
| `/checkout/welcome-back` | `seamless-reactivation/` | `src/app/welcome-back/` | Fully ported |
| `/checkout/account-creation` | `account-creation/index.ts` | `src/app/account-creation/` | Fully ported |
| `/checkout/electronic-policy` | `electronic-policy/index.js` | `src/app/electronic-policy/` | Content ported |
| `/checkout/terms-of-customer-account-use` | `tocau/index.js` | `src/app/terms-of-customer-account-use/` | Content ported |

### On Hold ⏸️

| Route | Original | Status | Notes |
|-------|----------|--------|-------|
| `/checkout/quotepage/*` | `quote-page/init-quote-page.ts` | **ON HOLD** | Not active in production, no current plans to implement |

---

## 2. Analytics & Tracking

### 2.1 VT Analytics / Segment Events

#### Implemented ✅

| Event | Original Location | New Location | Status |
|-------|-------------------|--------------|--------|
| `Checkout Started` | `track-checkout-started.ts` | `checkout-tracking.ts` | ✅ Complete |
| `Purchase Completed` | `track-purchase-event.ts` | `checkout-tracking.ts` | ✅ Complete |
| `Plan Selected` | `track-event.ts` | `checkout-tracking.ts` | ✅ Complete |
| `Plan Preselected` | `track-event.ts` | `checkout-tracking.ts` | ✅ Complete |
| `Element Clicked` | `track-event.ts` | `GlobalEventTracker.tsx` | ✅ Complete |
| `User Entered Input` | `track-event.ts` | `GlobalEventTracker.tsx` | ✅ Complete |
| `User Logged In` | `track-event.ts` | `checkout-tracking.ts` | ✅ Complete |
| `User Login Failed` | `track-event.ts` | `checkout-tracking.ts` | ✅ Complete |
| `Card CVV Focused/Focusout` | `track-event.ts` | `checkout-tracking.ts` | ✅ Complete |
| `Card Number Focused/Focusout` | `track-event.ts` | `checkout-tracking.ts` | ✅ Complete |
| `Card Expiration Focused/Focusout` | `track-event.ts` | `checkout-tracking.ts` | ✅ Complete |
| `Content Viewed` | `track-event.ts` | `checkout-tracking.ts` | ✅ Complete |
| `Element Opened/Closed` | `track-event.ts` | `checkout-tracking.ts` | ✅ Complete |

#### On Hold / Not Needed ⏸️

| Event | Original Location | Status | Notes |
|-------|-------------------|--------|-------|
| `Quote Selected` | `track-quote-selection.ts` | **ON HOLD** | Quote pages not active in production |
| `Quote Preselected` | `track-quote-selection.ts` | **ON HOLD** | Quote pages not active in production |
| `Screen Viewed` | `track-event.ts` | **NOT NEEDED** | Not explicitly used in checkout |
| `Element Hovered` | `track-event.ts` | **NOT NEEDED** | Not implemented, rarely used |

### 2.2 New Relic Events

#### Implemented ✅

| Event | Original | New | Status |
|-------|----------|-----|--------|
| `checkout_error` | `nr-track.ts` | `error-tracking.ts` | ✅ Complete |
| `general_checkout_completed` | `general-checkout-tracking.ts` | `checkout-tracking.ts` | ✅ Complete |
| `escape_plan_button_clicked` | `nr-track.ts` | `checkout-tracking.ts` | ✅ Complete |
| `unknown_checkout_error` | N/A | `CheckoutNotReadyContent.tsx` | ✅ NEW - for unknown errors |
| `experiment` | `experiment.ts` | `checkout-tracking.ts` | ✅ Complete - uses `trackExperiment()` |
| `make_purchase_retry` | `make-purchase-retry-manager.ts` | `purchase-membership.ts` | ✅ Complete - tracked on retry |
| `checkout_completion_routing` | `checkout-completion-routing.ts` | `checkout-tracking.ts` | ✅ Complete - `trackCheckoutCompletionRouting()` |
| `user_email_already_exists` | `nr-track.ts` | `checkout-tracking.ts` | ✅ Complete - `trackUserEmailAlreadyExists()` |
| `INITIALIZE_AGENT` | `new-relic.ts` | `newrelic-browser.ts` | ✅ Complete - via event listener |

#### Skipped (Not Applicable) ❌

| Event | Original Location | Status | Notes |
|-------|-------------------|--------|-------|
| `chat_started` (Genesys) | `track-genesys-event.ts` | **SKIP** | Feature flag never enabled in production |

### 2.3 New Relic Custom Attributes

#### Implemented ✅

| Attribute | Status | Location |
|-----------|--------|----------|
| Error type/message | ✅ | `error-tracking.ts` |
| Payment step | ✅ | `error-tracking.ts` |
| Error context | ✅ | `error-tracking.ts` |
| `url`, `origin`, `pathname` | ✅ | `newrelic-browser.ts` - Set on agent load |
| `userAgent` | ✅ | `newrelic-browser.ts` - Set on agent load |
| URL query params as attributes | ✅ | `newrelic-browser.ts` - Dynamic attribute setting |

### 2.4 New Relic Setup Status

| Item | Status | Priority | Notes |
|------|--------|----------|-------|
| Agent initialization event listener | ✅ Complete | - | `initNewRelicBrowser()` in `newrelic-browser.ts` |
| Custom attributes on load | ✅ Complete | - | URL, path, userAgent set via event listener |
| Agent config script | ✅ Complete | - | Generated in `layout.tsx` |
| SPA loader | ✅ Complete | - | `nr-loader-spa-1.290.0.min.js` |
| Source maps upload | ❌ Missing | **HIGH** | For error stack traces - need build integration |
| Core Web Vitals | ❌ Missing | **MEDIUM** | Performance monitoring - need `web-vitals` package |
| `setPageViewName` | ✅ Complete | - | `NewRelicRouteTracker.tsx` - sets on each route |
| `setCurrentRouteName` | ✅ Complete | - | `NewRelicRouteTracker.tsx` - tracks SPA route changes |

---

## 3. Services & Business Logic

### 3.1 Services

| Service | Original | New | Status |
|---------|----------|-----|--------|
| `quoteManager` | `quote-manager.ts` | N/A - State in components | ✅ Refactored to React state |
| `planManager` | `plan-manager.ts` | N/A - State in components | ✅ Refactored to React state |
| `recaptchaService` | `recaptcha-service.ts` | `recaptcha-service.ts` | ✅ Ported |
| `eventEmitter` | `event-emitter.ts` | `event-emitter.ts` | ✅ Ported |
| `sessionContext` | `session-context.ts` | `SessionContextProvider.tsx` | ✅ Refactored to React Context |
| `vtAnalytics` | `vtAnalytics.ts` | `vt-analytics.ts` | ✅ Ported |
| `sessionReplay` | `session-replay.ts` | `session-replay.ts` | ✅ Ported |

### 3.2 Utilities

| Utility | Original | New | Status |
|---------|----------|-----|--------|
| `format-price.ts` | ✅ | ✅ | Ported |
| `format-phone.ts` | ✅ | ✅ | Ported |
| `calculate-churn-months.ts` | ✅ | ✅ | Ported |
| `extract-utm-parameters.ts` | ✅ | ✅ | Ported |
| `validate-checkout-form.ts` | ✅ | ✅ | Ported |
| `get-api-domain.ts` | ✅ | ✅ | Ported |
| `cookie.ts` | ✅ | ✅ | Ported |
| `spinner.ts` | ✅ | ✅ | Ported |
| `detect-reactivation-flow.ts` | ✅ | Inline in components | Refactored |
| `fetch-catalog-item.ts` | ✅ | Via GraphQL API | Refactored |
| `markdown-parser.ts` | ✅ | N/A | Not needed in Next.js |
| `intellimize-helper.ts` | ✅ | ❌ Not ported | **LOW** - A/B testing helper |
| `redirect-to-legacy-checkout.ts` | ✅ | ❌ Not needed | Escape plan inline |
| `setup-error-message-observer.ts` | ✅ | ❌ Not needed | DOM observer pattern |
| `setup-phone-link.ts` | ✅ | Inline in components | Refactored |
| `toggle-password-visibility.ts` | ✅ | Inline in components | Refactored |

### 3.3 Error Classes

| Class | Original | New | Status |
|-------|----------|-----|--------|
| `SystemError` | ✅ | ✅ | Ported |
| `IntegrationError` | ✅ | ✅ | Ported |
| `UserValidationError` | ✅ | ✅ | Ported |
| `BusinessRuleError` | ✅ | ✅ | Ported |
| `PaymentDeclineError` | ✅ | ✅ | Ported |
| `PurchaseResponseError` | ✅ | ✅ | Ported |
| `CheckoutFlowError` | ✅ | ✅ | Ported |
| `UserBehaviorError` | ✅ | ✅ | Ported |

---

## 4. Payment Integration

### 4.1 Payment Methods

| Method | Original | New | Status |
|--------|----------|-----|--------|
| Credit Card (Braintree Hosted Fields) | ✅ | ✅ | Complete |
| Apple Pay | ✅ | ✅ | Complete |
| Google Pay | ✅ | ✅ | Complete |
| PayPal | ✅ | ✅ | Complete |
| Saved Credit Card | ✅ | ✅ | Complete |

### 4.2 Payment Features

| Feature | Original | New | Status |
|---------|----------|-----|--------|
| Braintree client singleton | ✅ | ✅ | `useBraintreeClient.ts` |
| Payment method toggling | ✅ | ✅ | Visibility-based |
| Error handling | ✅ | ✅ | User-friendly messages |
| Retry manager | ✅ | ✅ | Implemented with ECOMM-587 flag |
| Form validation | ✅ | ✅ | Complete |
| reCAPTCHA integration | ✅ | ✅ | Complete |

### 4.3 Package Quote Installments

**✅ Feature Status: IMPLEMENTED**

> 📄 See detailed report: [PACKAGE_INSTALLMENT_FEATURE.md](./PACKAGE_INSTALLMENT_FEATURE.md)

| Component | Original | New | Status |
|-----------|----------|-----|--------|
| Quote REST API integration | ✅ | ✅ | `src/lib/api/quote.ts` |
| `number_of_payments` handling | ✅ | ✅ | Merged with purchasable |
| Installment calculation | ✅ | ✅ | `src/lib/utils/installments.ts` |
| Package detection | ✅ | ✅ | Via `item_type_id` |
| PricingCard installment UI | ✅ | ✅ | Dark & light themes |
| Analytics: `has_installments` | ✅ | ✅ | Tracked correctly |
| Analytics: `billing_interval` | ✅ | ✅ | `installments` / `one_time` / `monthly` |

**Implementation Details:**
- Quote data fetched when `?q=` param present
- Installment data merged with `purchasable` only (not `options`)
- Only 2 installments supported (per business rules)
- UI shows "2 installments of $X" and payment details

**E2E Test Coverage:**
- ✅ Installment pricing display verification
- ✅ Full checkout flow with installment payment
- ✅ Package-specific UI (hours display, no /mo suffix)
- Test quote ID: `e9b99823-67dd-4e4d-9671-b9346ab9805d`

---

## 5. Feature Flags (LaunchDarkly)

### Implemented ✅

| Flag | Original Constant | New Constant | Status |
|------|-------------------|--------------|--------|
| `ECOMM-771-retargeting` | ✅ | ✅ | Implemented |
| `ECOMM-685-AI-winback-message` | ✅ | ✅ | Implemented |
| `ECOMM-682-new-checkout-promo-codes` | ✅ | ✅ | Implemented |
| `ECOMM-614-lead-resubmission` | ✅ | ✅ | Implemented |
| `ECOMM-827-churned-client-promocode` | ✅ | ✅ | Implemented |
| `ECOMM-587` (retry logic) | ✅ | ✅ | Implemented - auto-retry on retryable errors |
| `ECOMM-829-luminex-theme` | ✅ | ❌ Not needed | Theme is default |

---

## 6. Third-Party Integrations

| Integration | Original | New | Status |
|-------------|----------|-----|--------|
| **Braintree** | ✅ | ✅ | Complete |
| **LaunchDarkly** | ✅ | ✅ | Complete |
| **Segment Analytics** | ✅ | ✅ | Complete |
| **VT Events API** | ✅ | ✅ | Complete (with localhost proxy) |
| **Amplitude Session Replay** | ✅ | ✅ | Complete |
| **New Relic Browser** | ✅ | ✅ | Complete (init, attributes, error tracking) |
| **reCAPTCHA v3** | ✅ | ✅ | Complete |
| **Intellimize** | ✅ | ❌ Skip | Webflow-only feature, not applicable to Next.js |
| **Genesys Chat** | ✅ | ❌ Skip | Feature flag never enabled in production, skip migration |

### New Relic Browser Details

The New Relic integration includes:
- ✅ Agent initialization via `newrelic-browser.ts`
- ✅ SPA loader (`nr-loader-spa-1.290.0.min.js`) in `layout.tsx`
- ✅ Custom attributes (url, pathname, userAgent, query params)
- ✅ Error tracking with `noticeError()` and `addPageAction()`
- ✅ Event tracking for all checkout events
- ⚠️ Source maps not uploaded (stack traces not readable)
- ⚠️ Core Web Vitals not tracked yet

---

## 7. Testing

### 7.1 Unit Tests

| Area | Original Coverage | New Coverage | Status |
|------|-------------------|--------------|--------|
| Business logic | ~80% | ~30% | ⚠️ Needs improvement |
| Utilities | ~90% | ~50% | ⚠️ Needs improvement |
| Components | ~60% | ~10% | ⚠️ Needs improvement |
| API functions | ~70% | ~20% | ⚠️ Needs improvement |

**Current Unit Test Files (7 total):**
```
src/lib/utils/__tests__/
├── calculate-churn-months.test.ts
├── currency-to-country.test.ts
├── extract-utm-parameters.test.ts
├── format-phone.test.ts
├── format-price.test.ts
└── validate-checkout-form.test.ts

src/lib/api/__tests__/
└── purchase-membership.test.ts
```

**Priority Test Areas:**
1. `src/lib/payment/` - Payment integrations (high risk)
2. `src/lib/api/` - API functions (high impact)
3. `src/app/components/checkout/` - Payment forms (user-facing)
4. `src/lib/analytics/` - Tracking functions (business metrics)

### 7.2 E2E Tests

| Test | Original | New | Status |
|------|----------|-----|--------|
| Catalog checkout (credit card) | N/A | ✅ | **NEW** - Primary checkout flow |
| Reactivation checkout | ✅ | ✅ | Ported |
| Lead quote checkout | ✅ | ✅ | Ported (quote-based checkout) |
| Client quote checkout | ✅ | ✅ | Ported |
| International checkout | ✅ | ✅ | Ported (in quote-checkout tests) |
| Quote error handling | N/A | ✅ | **NEW** - Invalid/missing quote ID |
| Account creation | ✅ | ✅ | Ported |
| Package quote installment | ✅ | ✅ | Ported (3 tests) |

**E2E Test Structure:**
```
tests/e2e/
├── helpers/
│   ├── fill-credit-card.ts        # Fill Braintree hosted fields
│   ├── handle-credit-card-button.ts
│   ├── handle-terms-checkbox.ts
│   ├── submit-credit-card-form.ts
│   ├── user-login.ts              # Auth helpers
│   └── index.ts                   # Re-exports
├── account-creation.spec.ts              # Account creation (16 tests)
├── catalog-checkout-credit-card.spec.ts  # Catalog-based checkout (4 tests, 1 skipped)
├── client-quote-checkout.spec.ts         # Client checkout (5 tests)
├── package-installment-checkout.spec.ts  # Package installments (3 tests)
├── quote-checkout-credit-card.spec.ts    # Quote-based checkout (4 tests)
└── reactivation-checkout.spec.ts         # Welcome back flow (4 tests)
```

**Total: 35 tests passing, 1 skipped**

**Known Issues:**
- ⚠️ Processor decline test skipped due to backend bug - card `4000111111111115` should trigger `PURCHASE_ERROR` but backend returns success. Reported to backend team.

**Running E2E Tests:**
```bash
# Run tests locally (starts dev server)
npm run test:e2e

# Run with UI mode
npm run test:e2e:ui

# Run against staging
STAGING_URL=1 npm run test:e2e

# Run specific test file
npm run test:e2e -- quote-checkout-credit-card.spec.ts
```

**Test Data Notes:**
- Quote IDs in tests are from staging and may expire
- Update quote IDs in `tests/e2e/test-config.ts` when quotes expire
- Catalog item IDs are more stable (product catalog)
- Package installment quote requires `number_of_payments = 2` configuration

---

## 8. Priority Action Items

### High Priority 🔴

1. **New Relic Source Maps Upload**
   - Configure source map upload in build pipeline (Netlify build hooks)
   - Ensure error stack traces are readable in New Relic
   - Consider using `@newrelic/publish-sourcemap` package

### Medium Priority 🟡

2. **Core Web Vitals Monitoring**
   - Install `web-vitals` package
   - Track LCP, FID, CLS, INP, TTFB metrics
   - Send metrics to New Relic via `addPageAction`

3. **Unit Test Coverage**
   - Current: ~30% (7 test files)
   - Target: >80%
   - Focus areas: components, hooks, API functions
   - Use Jest + React Testing Library

### Completed ✅

4. **SPA Route Tracking** (Dec 1, 2025)
   - ✅ `setPageViewName` for custom page names
   - ✅ `setCurrentRouteName` for route changes
   - Implementation: `NewRelicRouteTracker.tsx`

### On Hold ⏸️

5. **Quote Pages Implementation**
   - Not active in production
   - No current plans to implement
   - Can be added later if needed

### Skipped (Not Applicable) ❌

6. **Intellimize Integration**
   - Webflow-only feature
   - Not applicable to Next.js implementation

7. **Genesys Chat Integration**
   - Feature flag `ecomm-106-genesys-webchat` was never enabled in production
   - No migration needed

---

## 9. Recommendations

### Before Production Launch

1. **Configure source map uploads** - Critical for debugging production errors
2. **Add Core Web Vitals** - Essential for performance monitoring and SEO
3. **Increase unit test coverage** - Target >80% to catch regressions

### Post-Launch Improvements

1. **Add SPA route tracking** - Better page view analytics
2. **Analytics audit** - Compare event patterns with original production
3. **Performance optimization** - Based on Core Web Vitals data

### Completed ✅

1. **New Relic agent setup** - Custom attributes, error tracking complete
2. **Purchase retry logic** - ECOMM-587 flag implemented with New Relic tracking
3. **E2E test suite** - 35 tests covering all major flows
4. **Experiment tracking** - Page view and purchase conversion tracking

### Skipped Items

1. **Quote Pages** - On hold, not active in production
2. **Genesys Chat** - Feature flag never enabled, skip migration
3. **Intellimize** - Webflow-specific, not applicable to Next.js

---

## 10. New Gaps Identified (Dec 1, 2025)

During the codebase review, the following additional gaps were identified:

### 10.1 Source Map Upload for New Relic ❌

**Issue:** `productionBrowserSourceMaps: false` in `next.config.js` means error stack traces in New Relic will be minified and unreadable.

**Solution Options:**
1. Use `@newrelic/publish-sourcemap` package in build process
2. Configure Netlify build hooks to upload source maps
3. Enable `productionBrowserSourceMaps: true` and configure upload

**Priority:** HIGH - Critical for production debugging

### 10.2 Core Web Vitals ❌

**Issue:** No performance monitoring for LCP, FID, CLS, INP, TTFB metrics.

**Solution:**
```typescript
// Install: npm install web-vitals
import { onCLS, onFID, onLCP, onINP, onTTFB } from 'web-vitals';

function sendToNewRelic(metric) {
  window.newrelic?.addPageAction('web_vitals', {
    name: metric.name,
    value: metric.value,
    id: metric.id,
  });
}

onCLS(sendToNewRelic);
onFID(sendToNewRelic);
onLCP(sendToNewRelic);
onINP(sendToNewRelic);
onTTFB(sendToNewRelic);
```

**Priority:** MEDIUM - Important for performance monitoring and SEO

### 10.3 SPA Route Change Tracking ✅ (Implemented Dec 1, 2025)

**Status:** COMPLETE

**Implementation:** `src/lib/analytics/NewRelicRouteTracker.tsx`

Features:
- Uses `usePathname` from Next.js to detect route changes
- Calls `setPageViewName()` on every page with formatted name (e.g., "checkout-home", "checkout-welcome-back")
- Calls `setCurrentRouteName()` only on actual route changes (not initial mount)
- Integrated into `AnalyticsProvider`

**Page Name Format:**
- `/` → `checkout-home`
- `/welcome-back` → `checkout-welcome-back`
- `/account-creation` → `checkout-account-creation`

### 10.4 Unit Test Coverage Gap ⚠️

**Issue:** Only 7 unit test files exist (~30% coverage). Target is >80%.

**Missing Test Coverage:**
| Directory | Files | Tests Needed |
|-----------|-------|--------------|
| `src/lib/payment/` | 9 files | Braintree client, payment init |
| `src/lib/api/` | 5 files (1 tested) | checkout-details, authenticate-user |
| `src/lib/analytics/` | 11 files | checkout-tracking, error-tracking |
| `src/lib/services/` | 4 files | recaptcha, retry manager |
| `src/app/components/checkout/` | 18 files | Payment forms, UI components |

**Priority:** MEDIUM - Important for maintainability

---

## Appendix A: File Mapping

### Original → New File Mapping

```
originals/checkout-ts/src/
├── components/
│   ├── express-checkout/         → src/app/ (page.tsx, CheckoutClient.tsx)
│   ├── seamless-reactivation/    → src/app/welcome-back/
│   ├── account-creation/         → src/app/account-creation/
│   ├── quote-page/               → ❌ NOT IMPLEMENTED
│   ├── electronic-policy/        → src/app/electronic-policy/
│   ├── tocau/                    → src/app/terms-of-customer-account-use/
│   └── shared/
│       ├── services/
│       │   ├── tracking/         → src/lib/analytics/
│       │   ├── quote-manager.ts  → Component state
│       │   ├── plan-manager.ts   → Component state
│       │   └── recaptcha-service.ts → src/lib/services/
│       └── vtAnalytics/          → src/lib/analytics/vt-analytics.ts
├── constants/                    → src/lib/constants/
├── utils/                        → src/lib/utils/
└── types/                        → src/types/
```

---

## Appendix B: Environment Variables

### Required Variables

| Variable | Original | New | Status |
|----------|----------|-----|--------|
| `NEXT_PUBLIC_BRAINTREE_TOKENIZATION_KEY` | env | env | ✅ |
| `NEXT_PUBLIC_RECAPTCHA_SITE_KEY` | env | env | ✅ |
| `NEXT_PUBLIC_LD_CLIENT_SIDE_ID` | env | env | ✅ |
| `NEXT_PUBLIC_VT_EVENTS_ENDPOINT` | env | env | ✅ |
| `NEXT_PUBLIC_HOST` | env | env | ✅ |
| `NEXT_PUBLIC_BASE_PATH` | N/A | env | ✅ NEW |
| `LD_SDK_KEY` | N/A | env | ✅ Server-side LD |

---

*Generated by migration gap analysis tool*  
*Last updated: December 1, 2025*

