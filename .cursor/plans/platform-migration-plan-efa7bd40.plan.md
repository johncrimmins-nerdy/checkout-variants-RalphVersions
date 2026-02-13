<!-- 0c3ff00a-c80f-4882-b49b-b93078835244 b6f5f75b-a7fb-41b8-9c81-d7a463b90abd -->
# Platform Migration Plan: Webflow to Next.js Checkout System

## Executive Summary

Migrate the existing Varsity Tutors checkout system from a Webflow-embedded TypeScript library to a standalone Next.js 15 application. The migration will eliminate Webflow dependency while preserving all existing business logic, payment flows, and third-party integrations.

**Scope:** Checkout flows, quote pages, and account creation
**Constraint:** Keep existing GraphQL API and authentication unchanged
**Goal:** Improve developer experience and maintainability without changing business functionality

---

## Current System Analysis

### Architecture Overview

The current system (`originals/checkout-ts/`) is a TypeScript library built with Vite that embeds into Webflow pages:

**Entry Points:**

- `/checkout` - Express checkout with multiple payment methods
- `/checkout/welcome-back` - Seamless reactivation for returning customers
- `/checkout/quotepage/*` - Quote selection and package browsing
- `/checkout/account-creation` - Post-purchase account setup
- `/checkout/electronic-policy` - Policy document display
- `/checkout/terms-of-customer-account-use` - Terms of use display

**Key Business Flows:**

1. **Quote-Based Checkout** - Leads receive custom quotes from sales → select package → checkout
2. **Catalog-Based Checkout** - Direct purchase from catalog items via URL parameters
3. **Seamless Reactivation** - Returning customers with saved payment methods
4. **Package Checkout** - Multi-hour tutoring packages with installment payments
5. **Lead Resubmission** - Churned users re-entering the funnel with special pricing

### Core Business Rules

**Payment Processing:**

- Braintree Drop-in UI for credit cards with hosted fields
- Apple Pay, Google Pay, PayPal integrations
- Saved payment methods for authenticated users
- International payment support with currency conversion
- reCAPTCHA verification required for all purchases

**Pricing Logic:**

- Promo code application for catalog items
- Installment payment calculations (split pricing logic)
- Discount display with strike-through pricing
- Price validation between quote page and checkout

**User State Management:**

- Guest checkout for new leads
- Authenticated checkout for existing clients
- Client ID tracking via URL parameters (`?c=client-uuid`)
- Lead UUID tracking for quote-based flows
- Session context (UTM parameters, referrer, visitor ID)

**Feature Flags (LaunchDarkly):**

- `ECOMM_771_RETARGETING` - Personalized messaging by segment
- `ECOMM_685_AI_PERSONALIZED` - AI-generated winback messages
- `ECOMM_682_NEW_CHECKOUT_PROMO_CODES` - Promo code support
- `ECOMM_614_LEAD_RESUBMISSION` - Churned user flow
- `ECOMM_827_CHURNED_CLIENT_PROMOCODE` - Auto-applied promo codes
- `ECOMM_829_LUMINEX_THEME` - Theme variations
- `ECOMM_587` - Purchase retry logic

**Validation & Error Handling:**

- Checkout eligibility validation before rendering
- Payment decline handling with user-friendly messages
- API error mapping to display messages
- Retry manager for transient failures
- Form validation for credit cards and account creation

**Analytics & Tracking:**

- Amplitude for user behavior tracking
- New Relic for performance monitoring
- Segment/VT Analytics for checkout events
- Purchase event tracking with enhanced metadata
- Intellimize integration for A/B testing

### Third-Party Integrations

**Payment:** Braintree Web SDK v3.117.1
**Feature Flags:** LaunchDarkly client-side SDK
**Analytics:** @varsitytutors/event-tracker, Amplitude Session Replay, New Relic Browser Agent
**Security:** Google reCAPTCHA v3

### Technical Stack (Current)

- **Build:** Vite 6.0.9 with UMD/ES module outputs
- **Language:** TypeScript 4.x
- **Testing:** Vitest for units, Playwright for E2E
- **Deployment:** S3 → CloudFront CDN, loaded via script tag in Webflow
- **Environments:** Staging (vtstaging.com), Production (varsitytutors.com)

---

## Migration Strategy

### Phase 1: Foundation & Setup (Week 1-2) ✅ COMPLETED

**Goals:** Establish Next.js project structure and development environment

**Tasks:**

1. **Project Initialization**

- Create Next.js 15 app with App Router in workspace root
- Configure TypeScript with strict mode
- Set up ESLint flat config matching existing standards
- Configure Prettier and lint-staged
- Create `.env.local` template with required variables

2. **Development Environment**

- Set up local development with `npm run dev`
- Configure Netlify dev for local testing
- Create environment variable management (dev/staging/production)
- Set up VS Code workspace settings
- Document setup in README

3. **Testing Infrastructure**

- Configure Jest + React Testing Library for unit tests
- Set up Playwright for E2E tests
- Create test helpers and mocks library
- Configure coverage thresholds
- Set up test data generation utilities

4. **Deployment Pipeline**

- Configure Netlify build settings
- Set up environment variables in Netlify
- Create preview deployments for PRs
- Configure CloudFront or equivalent CDN
- Set up staging and production environments

**Key Files:**

- `src/app/layout.tsx` - Root layout with providers
- `src/lib/env.ts` - Environment variable validation
- `jest.config.ts`, `playwright.config.ts` - Test configuration
- `netlify.toml` - Deployment configuration

**Validation:**

- ✅ Next.js dev server runs locally
- ✅ Tests execute successfully
- ✅ Deployment preview works on Netlify

---

### Phase 2: Core Infrastructure & Services (Week 3-4)

**Goals:** Port shared utilities, services, and business logic

**Tasks:**

1. **API Client Layer**

- Port GraphQL query functions (`checkoutDetails`, `purchaseMembership`)
- Create typed API client with error handling
- Implement retry logic and timeout handling
- Add request/response logging
- Port `get-api-domain.ts` for environment detection

2. **Payment Service Abstraction**

- Create Braintree client initialization wrapper
- Port hosted fields setup and validation
- Abstract Apple Pay integration
- Abstract Google Pay integration
- Abstract PayPal integration
- Implement payment method factory pattern

3. **State Management**

- Port `QuoteManager` as React Context or Zustand store
- Port `PlanManager` for multi-plan selection
- Create session context provider
- Implement URL parameter extraction and validation
- Port event emitter to React hooks

4. **Business Logic Utilities**

- Port all `/utils` functions (formatting, validation, pricing)
- Create reusable hooks for common operations
- Port reCAPTCHA service
- Port tracking utilities (error tracking, event tracking)
- Create jurisdiction validation helpers

5. **Feature Flag Integration**

- Port LaunchDarkly client initialization
- Create React Context for feature flags
- Create hooks for flag access (`useLDFlag`)
- Port all flag constants

**Key Files:**

- `src/lib/api/` - API client functions
- `src/lib/payment/` - Payment integrations
- `src/lib/state/` - State management (Context/Zustand)
- `src/lib/utils/` - Utility functions
- `src/lib/flags/` - Feature flag integration
- `src/hooks/` - Custom React hooks

**Validation:**

- ✅ Unit tests pass for all ported utilities
- ✅ API client successfully calls staging endpoints
- ✅ Feature flags load correctly
- ✅ Payment SDK initializes without errors

---

### Phase 3: Checkout Flow Implementation (Week 5-7)

**Goals:** Build express checkout page with all payment methods

**Tasks:**

1. **Checkout Page Route** (`/checkout`)

- Create page component with URL parameter handling
- Implement loading states and error boundaries
- Port terms agreement checkbox logic
- Create payment method selection UI
- Implement escape plan button

2. **Credit Card Payment**

- Build credit card form with Braintree hosted fields
- Port form validation logic
- Implement card brand detection
- Create error message display
- Port submit handler with retry logic

3. **Alternative Payment Methods**

- Implement Apple Pay button with authorization flow
- Implement Google Pay button with authorization flow
- Implement PayPal button integration
- Handle payment method availability detection
- Port saved payment method display for authenticated users

4. **Purchase Flow**

- Port `makePurchase` function with all business logic
- Implement loading spinner and progress states
- Port error handling and user feedback
- Implement checkout completion routing
- Port post-purchase modal for reactivation flow

5. **Checkout UI Components**

- Build plan details display with pricing
- Create installment payment display
- Build discount/promo display
- Create personalized messaging component
- Build payment method cards (reusable)

**Key Files:**

- `src/app/checkout/page.tsx` - Main checkout page
- `src/components/checkout/` - Checkout-specific components
- `src/lib/checkout/` - Checkout business logic

**Validation:**

- ✅ Credit card checkout completes successfully
- ✅ Apple/Google Pay work on supported devices
- ✅ PayPal redirect flow works correctly
- ✅ Error states display appropriately
- ✅ E2E test for lead quote checkout passes

---

### Phase 4: Seamless Reactivation (Week 8)

**Goals:** Implement returning customer flow with saved payments

**Tasks:**

1. **Reactivation Page** (`/checkout/welcome-back`)

- Create page with authentication check
- Implement login modal for unauthenticated users
- Port saved payment method display
- Create plan switcher for multiple options
- Port "select different payment method" flow

2. **Saved Payment Handling**

- Display saved credit card info (last 4, expiry, brand)
- Implement CVV re-entry for saved cards
- Port payment method update logic
- Handle expired card scenarios

3. **Reactivation-Specific Logic**

- Port seamless reactivation purchase flow
- Implement success modal display
- Port logged-in toast notifications
- Create card logo update handler

**Key Files:**

- `src/app/checkout/welcome-back/page.tsx`
- `src/components/reactivation/` - Reactivation components

**Validation:**

- ✅ Authenticated user sees saved payment
- ✅ Reactivation purchase completes
- ✅ Success modal displays correctly
- ✅ E2E test for reactivation passes

---

### Phase 5: Quote Pages (Week 9-10)

**Goals:** Build quote browsing and package selection pages

**Tasks:**

1. **Quote Page Route** (`/checkout/quotepage/[...slug]`)

- Create dynamic route for quote pages
- Fetch and display quote data
- Implement package card grid layout
- Port pricing display logic (list vs quoted)
- Create "Select Package" CTAs

2. **Quote Business Logic**

- Port quote fetching from API
- Implement item data fetching (tutoring hours)
- Port installment calculation logic
- Create quote validation
- Port quote expiration handling

3. **Package Selection UI**

- Build package card component
- Display tutoring hours
- Show pricing with discounts
- Display installment information
- Create responsive grid layout

4. **Quote to Checkout Flow**

- Port "Get started" button logic
- Pass quote ID to checkout via URL
- Maintain pricing consistency
- Port lead UUID tracking

**Key Files:**

- `src/app/checkout/quotepage/[...slug]/page.tsx`
- `src/components/quote/` - Quote page components
- `src/lib/quote/` - Quote business logic

**Validation:**

- ✅ Quote page displays packages correctly
- ✅ Pricing matches between quote and checkout
- ✅ Package selection navigates properly
- ✅ E2E test for package quote checkout passes

---

### Phase 6: Account Creation (Week 11)

**Goals:** Build post-purchase account creation flow

**Tasks:**

1. **Account Creation Page** (`/checkout/account-creation`)

- Create form layout with validation
- Implement email/password fields
- Port form validation logic
- Create password visibility toggle
- Implement form pre-fill from session

2. **Account Creation Logic**

- Port submit handler with API integration
- Implement error handling and display
- Port success routing
- Create validation rules (password strength, email format)

3. **Account Creation UI**

- Build form fields with labels
- Create validation error display
- Implement loading states
- Build success confirmation

**Key Files:**

- `src/app/checkout/account-creation/page.tsx`
- `src/components/account-creation/` - Account creation components

**Validation:**

- ✅ Account creation form validates correctly
- ✅ Successful account creation
- ✅ Error messages display appropriately

---

### Phase 7: Supporting Pages (Week 12)

**Goals:** Implement policy and terms pages

**Tasks:**

1. **Electronic Policy Page** (`/checkout/electronic-policy`)

- Port policy content (markdown → React)
- Create content display component
- Implement proper typography

2. **Terms of Use Page** (`/checkout/terms-of-customer-account-use`)

- Port terms content (markdown → React)
- Create content display component
- Implement proper typography

3. **Error Pages**

- Create 404 page
- Create quote expired page
- Create generic error page

**Key Files:**

- `src/app/checkout/electronic-policy/page.tsx`
- `src/app/checkout/terms-of-customer-account-use/page.tsx`
- `src/app/not-found.tsx`

**Validation:**

- ✅ Policy pages display correctly
- ✅ Content is accessible and readable

---

### Phase 8: Analytics & Monitoring (Week 13)

**Goals:** Integrate analytics and monitoring tools

**Tasks:**

1. **Analytics Integration**

- Port VT Analytics tracking
- Integrate Amplitude session replay
- Create page view tracking
- Implement event tracking for interactions
- Port checkout-specific events

2. **Error Monitoring**

- Integrate New Relic browser agent
- Configure error tracking
- Set up custom attributes
- Port Core Web Vitals monitoring

3. **Tracking Implementation**

- Port all tracking event calls
- Create tracking helper hooks
- Implement purchase event tracking
- Port experiment tracking

**Key Files:**

- `src/lib/analytics/` - Analytics integration
- `src/app/TelemetryProvider.tsx` - Analytics provider
- `instrumentation.ts` - New Relic setup

**Validation:**

- ✅ Page views tracked in Amplitude
- ✅ Purchase events fire correctly
- ✅ New Relic captures errors
- ✅ Analytics match production patterns

---

### Phase 9: Testing & Quality Assurance (Week 14-15)

**Goals:** Comprehensive testing and bug fixing

**Tasks:**

1. **Unit Test Coverage**

- Write tests for all business logic
- Test utility functions
- Test React components
- Test hooks and context providers
- Achieve >80% coverage

2. **E2E Test Suite**

- Port all existing Playwright tests
- Test lead quote checkout flow
- Test client quote checkout flow
- Test package quote checkout with installments
- Test reactivation flow
- Test international checkout
- Test account creation flow

3. **Cross-Browser Testing**

- Test Chrome/Safari/Firefox
- Test iOS Safari and Android Chrome
- Test Apple Pay on iOS
- Test Google Pay on Android
- Verify responsive layouts

4. **Payment Integration Testing**

- Test all payment methods in sandbox
- Test payment failures and error handling
- Test saved payment methods
- Verify Braintree Drop-in UI styling

5. **Accessibility Testing**

- Run axe-core accessibility scans
- Test keyboard navigation
- Verify screen reader compatibility
- Test focus management
- Ensure WCAG AA compliance

**Validation:**

- ✅ All E2E tests pass
- ✅ No Critical/Serious accessibility issues
- ✅ Cross-browser compatibility verified
- ✅ All payment methods tested

---

### Phase 10: Staging Deployment & UAT (Week 16)

**Goals:** Deploy to staging and conduct user acceptance testing

**Tasks:**

1. **Staging Deployment**

- Deploy to Netlify staging environment
- Configure environment variables
- Set up staging API endpoints
- Verify feature flags load correctly
- Test payment sandbox integration

2. **UAT Preparation**

- Generate test data (quotes, leads, users)
- Create UAT test plan document
- Set up test accounts
- Prepare test credit cards

3. **UAT Execution**

- Conduct end-to-end user testing
- Test all checkout flows
- Verify pricing calculations
- Test error scenarios
- Gather feedback and bug reports

4. **Performance Testing**

- Run Lighthouse CI on all pages
- Measure Core Web Vitals
- Test page load times
- Verify bundle sizes
- Optimize as needed

**Validation:**

- ✅ Staging environment fully functional
- ✅ UAT sign-off from stakeholders
- ✅ Performance metrics meet targets
- ✅ No critical bugs remaining

---

### Phase 11: Production Migration (Week 17-18)

**Goals:** Cutover to production with minimal disruption

**Tasks:**

1. **Pre-Launch Preparation**

- Final code review and audit
- Security review (API keys, secrets)
- Performance optimization
- Create rollback plan
- Prepare runbook for common issues

2. **Production Deployment**

- Deploy to production environment
- Configure production environment variables
- Set up production API endpoints
- Verify feature flags
- Test live payment processing

3. **DNS/Routing Cutover**

- Update Netlify routing for /checkout paths
- Configure base path if needed
- Test all entry points
- Monitor error rates

4. **Monitoring & Observation**

- Monitor New Relic dashboards
- Track error rates and conversion metrics
- Monitor payment processing success rates
- Watch for anomalies
- Collect user feedback

5. **Decommissioning**

- Archive Webflow pages (keep as reference)
- Remove old script loading
- Archive originals/ folder
- Update documentation
- Celebrate! 🎉

**Validation:**

- ✅ Production deployment successful
- ✅ All checkout flows working
- ✅ No increase in error rates
- ✅ Conversion rates maintained or improved
- ✅ Stakeholder approval

---

## Risk Management

### High-Risk Areas

1. **Payment Processing Changes**

- **Risk:** Braintree integration issues causing payment failures
- **Mitigation:** Extensive sandbox testing, gradual rollout, rollback plan

2. **API Compatibility**

- **Risk:** GraphQL API changes or unexpected responses
- **Mitigation:** Comprehensive error handling, API mocking in tests

3. **Session/Cookie Handling**

- **Risk:** Authentication issues due to cookie domain/path changes
- **Mitigation:** Test cross-domain cookies, verify credentials flow

4. **Business Logic Regression**

- **Risk:** Subtle bugs in pricing, validation, or routing logic
- **Mitigation:** 100% unit test coverage for business logic, E2E tests

5. **Analytics Gaps**

- **Risk:** Missing tracking events causing data blind spots
- **Mitigation:** Analytics audit checklist, comparison with production

### Rollback Strategy

- Keep Webflow pages active during gradual rollout
- Use feature flags to toggle between old/new checkout
- CloudFront cache configuration allows instant rollback
- Document rollback procedure in runbook

---

## Success Criteria

**Functional:**

- ✅ All existing checkout flows work identically
- ✅ All payment methods process successfully
- ✅ Pricing calculations match exactly
- ✅ Analytics events fire correctly
- ✅ Error handling works as expected

**Performance:**

- ✅ Lighthouse Performance score >85
- ✅ LCP <2.5s, FID <100ms, CLS <0.1
- ✅ Page load time <3s on 3G
- ✅ Time to Interactive <5s

**Quality:**

- ✅ Zero Critical/Serious accessibility issues
- ✅ >80% unit test coverage
- ✅ All E2E tests passing
- ✅ Zero production errors for 48 hours post-launch

**Business:**

- ✅ Conversion rates maintained or improved
- ✅ Payment success rate ≥99%
- ✅ No increase in support tickets
- ✅ Stakeholder approval and sign-off

---

## Post-Migration Improvements

After successful migration, consider these enhancements:

1. **Developer Experience**

- Add Storybook for component development
- Create developer documentation
- Set up automated visual regression testing

2. **Performance Optimization**

- Implement route prefetching
- Optimize bundle splitting
- Add service worker for offline support

3. **Feature Additions**

- A/B testing framework
- Enhanced error recovery flows
- Improved mobile UX

4. **Technical Debt Reduction**

- Refactor complex components
- Improve type safety
- Modernize legacy patterns

---

## Timeline Summary

**Total Duration:** 18 weeks (4.5 months)

- Weeks 1-2: Foundation
- Weeks 3-4: Infrastructure
- Weeks 5-7: Checkout
- Week 8: Reactivation
- Weeks 9-10: Quote Pages
- Week 11: Account Creation
- Week 12: Supporting Pages
- Week 13: Analytics
- Weeks 14-15: QA
- Week 16: UAT
- Weeks 17-18: Production Launch

**Team Size:** 2-3 engineers full-time

---

## Dependencies & Prerequisites

**Before Starting:**

- Access to staging and production environments
- Braintree sandbox account credentials
- LaunchDarkly access and API keys
- Analytics platform access (Amplitude, New Relic)
- Netlify account with proper permissions
- API documentation for GraphQL endpoints

**External Dependencies:**

- No breaking API changes during migration
- Feature flag configuration remains accessible
- Payment processor sandbox availability
- QA/stakeholder availability for UAT

### To-dos

- [x] Complete Phase 1: Foundation & Setup - Project initialization and dev environment ✅
- [x] Complete Phase 2: Core Infrastructure & Services - Port utilities and business logic ✅
- [x] Complete Phase 3: Checkout Flow Implementation - Build express checkout page ✅
- [x] Complete Phase 4: Seamless Reactivation - Implement returning customer flow ✅
- [x] Complete Phase 6: Account Creation - Build post-purchase account creation ✅
- [x] Complete Phase 7: Supporting Pages - Implement policy and terms pages ✅
- [x] Complete Phase 8: Analytics & Monitoring - ✅ 90% complete (source maps & CWV remaining)
- [x] Complete Phase 5: Quote Pages - ON HOLD (not active in production, no current plans)
- [ ] Complete Phase 9: Testing & QA - Comprehensive testing and bug fixing (IN PROGRESS - E2E done, unit tests needed)
- [ ] Complete Phase 10: Staging Deployment & UAT - Deploy and conduct user acceptance testing
- [ ] Complete Phase 11: Production Migration - Cutover to production with monitoring

### Recent Progress Notes

**📋 Gap Analysis Report:** See `docs/MIGRATION_GAP_ANALYSIS.md` for detailed comparison with original implementation.

**Latest Session (Dec 1, 2025):**
- ✅ Reviewed and updated migration gap analysis with accurate status
- ✅ Confirmed New Relic agent initialization is fully implemented
- ✅ Confirmed MAKE_PURCHASE_RETRY tracking is implemented
- ✅ Updated Phase 8 status from "In Progress" to "Complete" (90%)
- ✅ Identified remaining gaps: source maps upload, Core Web Vitals

**Previous Session (Nov 28, 2025):**
- ✅ Migrated all E2E tests from original implementation
- ✅ Added package installment checkout E2E tests (4 tests)
- ✅ Fixed ESLint configuration for Playwright rules
- ✅ Identified and documented backend bug with processor decline handling
- ✅ **Total: 35 E2E tests passing across 6 test files**

**Phase 8 Complete ✅ - Analytics & Monitoring (95%):**
- ✅ VT Analytics tracking with proxy for localhost CORS
- ✅ Amplitude session replay integration
- ✅ Segment analytics integration
- ✅ New Relic browser agent setup (SPA loader v1.290.0)
- ✅ New Relic agent initialization event listener (`newrelic-browser.ts`)
- ✅ New Relic custom attributes on page load (url, pathname, userAgent)
- ✅ New Relic query params as custom attributes
- ✅ Global error handlers (window.error, unhandledrejection)
- ✅ Unknown checkout error reporting to New Relic
- ✅ Checkout-specific event tracking (start, purchase, plan selection)
- ✅ Global event tracker for clicks, focus, blur
- ✅ CSP configuration for analytics domains
- ✅ Purchase Retry Manager with New Relic tracking (MAKE_PURCHASE_RETRY event)
- ✅ Experiment tracking (trackExperiment, trackExperimentPageView, trackExperimentPurchase)
- ✅ User email already exists tracking
- ✅ Checkout completion routing tracking
- ✅ SPA Route tracking with `setPageViewName` and `setCurrentRouteName` (`NewRelicRouteTracker.tsx`)
- ⏳ New Relic source maps uploading setup (need @newrelic/publish-sourcemap)
- ⏳ Core Web Vitals monitoring (need web-vitals package)

**Phase 9 In Progress - Testing & QA:**
- ✅ Error handling improvements (item not found, API errors)
- ✅ User-friendly error messages with phone links
- ✅ Dark theme error UI with consistent box styling
- ✅ E2E test suite structure created with Playwright
- ✅ E2E helpers ported (fill-credit-card, handle-terms, submit-form, user-login)
- ✅ Catalog checkout E2E tests (4 tests, 1 skipped - backend bug)
- ✅ Reactivation checkout E2E tests (4 tests)
- ✅ Quote-based checkout E2E tests (4 tests)
- ✅ Client checkout E2E tests (5 tests)
- ✅ Account creation E2E tests (16 tests)
- ✅ Package installment checkout E2E tests (3 tests)
- ✅ **Total: 35 E2E tests passing (1 skipped - backend bug)**
- ⚠️ **Backend Bug Identified:** Processor decline test card (4000111111111115) succeeds instead of failing. Backend team notified.
- ⏳ Unit test coverage expansion (current ~30%, target >80%)
- ⏳ Cross-browser testing (Chrome, Safari, Firefox)
- ⏳ Accessibility testing (axe-core)

**Phase 5 On Hold - Quote Pages:**
- ⏸️ Not active in production
- ⏸️ No current plans to implement
- ⏸️ Can be added later if business need arises

**Skipped Items (Not Applicable):**
- ❌ Intellimize - Webflow-only feature, not applicable to Next.js
- ❌ Genesys Chat - Feature flag `ecomm-106-genesys-webchat` never enabled in production