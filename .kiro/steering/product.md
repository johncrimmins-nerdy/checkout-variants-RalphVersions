# Product Documentation: Varsity Tutors Checkout System

## Product Overview

### What It Does

The Varsity Tutors Checkout System is a payment and purchase flow application that enables customers to:
- Purchase tutoring memberships and packages with multiple payment methods
- Select and purchase customized quotes provided by the sales team
- Reactivate expired memberships with saved payment information
- Create accounts after successful purchases

### Who It Serves

**Primary Users:**
- **New Leads** - Prospective customers receiving personalized quotes from sales
- **Returning Customers** - Previously active clients reactivating their memberships
- **Direct Buyers** - Users purchasing catalog items directly (via marketing campaigns)
- **International Customers** - Users purchasing with non-USD currencies

**Secondary Users:**
- **Sales Team** - Generate quotes that lead to checkout flows
- **Marketing Team** - Create campaigns with direct catalog item links
- **Support Team** - Assist customers through payment issues

### Main Value Proposition

**For Customers:**
- Multiple convenient payment options (credit card, Apple Pay, Google Pay, PayPal)
- Saved payment methods for quick reactivation
- Transparent pricing with installment options for packages
- Personalized messaging and promotional pricing
- Secure payment processing with industry-standard security

**For Business:**
- Optimized conversion funnel reducing purchase friction
- Support for complex business rules (quotes, packages, installments, promos)
- Comprehensive analytics and tracking for optimization
- Flexible feature flag system for A/B testing and gradual rollouts
- International payment support expanding market reach

---

## Business Logic Summary

### Core Purchase Flows

#### 1. Quote-Based Checkout
**Entry:** Customer receives email/SMS with quote link → `/quotes?lead_id={uuid}`
**Flow:**
1. Customer views 1-3 personalized package quotes with pricing
2. Selects package → redirects to `/checkout?q={quoteId}&lead_id={leadUuid}`
3. Completes payment
4. Redirected to account creation or success page

**Business Rules:**
- Quotes expire after configurable period
- Pricing locked at quote generation (no recalculation)
- Package quotes can include installment payment terms
- Discounts pre-applied at quote generation

#### 2. Catalog-Based Checkout
**Entry:** Marketing campaign or direct link → `/checkout?catalogItemId={uuid}`
**Flow:**
1. Checkout page loads with catalog item details
2. Pricing fetched in real-time from API
3. Promo codes can be applied (feature flag controlled)
4. Completes payment
5. Redirected to account creation or success page

**Business Rules:**
- Real-time pricing from catalog API
- Promo code validation required before purchase
- Currency determined by user location or catalog item config
- No installments for catalog items

#### 3. Seamless Reactivation
**Entry:** Retargeting email/campaign → `/checkout/welcome-back?catalogItemId={uuid}`
**Flow:**
1. If not authenticated → login modal displays on checkout page
2. After auth → saved payment method displays
3. Optional: CVV re-entry for security
4. One-click purchase with saved payment
5. Success modal displays (no redirect)

**Business Rules:**
- Must be authenticated user with purchase history
- Can view and select from multiple plan options
- Saved payment methods require CVV for security
- Personalized "winback" messaging via AI or segments
- Expired cards handled gracefully with fallback to new payment

---

## Current Migration Intent

### Why Migrate?

**Primary Goal:** Eliminate Webflow dependency to improve developer experience and maintainability

**Pain Points with Current System:**
1. **Webflow Lock-in** - Changes require Webflow Designer access and export, creating deployment bottlenecks
2. **Limited Development Tools** - No hot reload, limited debugging, awkward build process
3. **Styling Constraints** - Webflow CSS conflicts with custom components
4. **Testing Challenges** - Difficult to test in isolation from Webflow environment
5. **Bundle Management** - Single UMD bundle limits code splitting and optimization
6. **Version Control** - Webflow HTML/CSS not easily version controlled or reviewed

### Migration Goals

**Technical Improvements:**
- Modern Next.js 15 with App Router for optimal performance
- Component-based architecture for better maintainability
- Hot reload and fast refresh for developer productivity
- TypeScript strict mode for type safety
- Automated testing with Jest and Playwright
- Code splitting and bundle optimization
- Server-side rendering for SEO and performance

**Operational Improvements:**
- Standard git workflow for all changes
- Code review process via pull requests
- Automated CI/CD with preview deployments
- Rollback capability via version control
- Better documentation and onboarding

**Constraints:**
- **No API Changes** - Keep existing GraphQL API unchanged
- **No Auth Changes** - Maintain current authentication flow
- **Feature Parity** - All existing features must work identically
- **Zero Downtime** - Gradual rollout with instant rollback capability

### Expected Outcomes

**Immediate Benefits:**
- Faster development velocity (estimates: 30-40% faster)
- Reduced deployment complexity
- Better error handling and debugging
- Improved performance metrics (Lighthouse scores >85)
- Enhanced developer satisfaction

**Long-Term Benefits:**
- Easier to add new features
- Simpler A/B testing and experimentation
- Better analytics and monitoring integration
- Foundation for future checkout enhancements
- Improved accessibility and mobile experience

### Post-Migration Enhancement Opportunities

**Phase 2 Improvements (Post-Launch):**
1. **Checkout Abandonment Recovery** - Supabase integration for storing partial checkout state, email reminders
2. **Enhanced Analytics** - Granular funnel tracking, heatmaps, session recordings
3. **Mobile Optimization** - Native-feeling mobile experience, touch optimizations
4. **Accessibility Improvements** - Enhanced screen reader support, better keyboard navigation
5. **Performance** - Route prefetching, service worker, offline support
6. **A/B Testing Framework** - Built-in experimentation platform
7. **Internationalization** - Multi-language support beyond English

---

*Document Version: 1.0*
*Last Updated: January 2025*
*Owner: Engineering Team*
