# Varsity Tutors Checkout System

Modern Next.js 15 application for handling checkout, payments, and quote management for Varsity Tutors.

## Overview

Next.js application for Varsity Tutors checkout, payments, and quote management. Handles express checkout, seamless reactivation for returning customers, and post-purchase account creation.

## Key Features

- **Express Checkout** - Multiple payment methods (Credit Card, Apple Pay, Google Pay, PayPal)
- **Quote Management** - Browse and select from personalized tutoring packages
- **Seamless Reactivation** - One-click purchase for returning customers with saved payments
- **International Support** - Multi-currency payment processing
- **Account Creation** - Post-purchase account setup flow
- **Feature Flags** - LaunchDarkly integration for A/B testing and gradual rollouts
- **Analytics** - Comprehensive tracking with Amplitude, New Relic, and VT Analytics

## Tech Stack

- **Framework:** Next.js 15 with App Router
- **Language:** TypeScript 5.7 (strict mode)
- **Styling:** Tailwind CSS 3.4
- **Testing:** Jest + React Testing Library, Playwright for E2E
- **Payment:** Braintree Web SDK
- **Analytics:** Amplitude, New Relic, Segment, Meta Pixel
- **Deployment:** Netlify with preview deployments

## Base Path Configuration

**IMPORTANT:** This application runs under a base path: `/checkout`

All routes are prefixed with this base path. For example:
- Homepage: `https://www.varsitytutors.com/checkout`
- Quotepage: `https://www.varsitytutors.com/checkout/quotepage/...`

Set via `NEXT_PUBLIC_BASE_PATH` environment variable (defaults to `/checkout`).

## Prerequisites

- Node.js >= 22.0.0
- npm >= 10.0.0
- Access to staging environment variables
- Braintree sandbox credentials (for local development)

## Getting Started

### 1. Clone and Install

```bash
# Clone the repository
git clone <repository-url>
cd checkout-app

# Install dependencies
npm install
```

### 2. Configure Environment

**Copy the environment template:**
```bash
cp .env.example .env.local
```

**Edit `.env.local` and add your API keys:**

Required keys for local development:
- `NEXT_PUBLIC_LAUNCHDARKLY_CLIENT_ID` - Get from LaunchDarkly dashboard
- `NEXT_PUBLIC_BRAINTREE_TOKENIZATION_KEY` - Get sandbox key from Braintree
- `NEXT_PUBLIC_RECAPTCHA_SITE_KEY` - Get test key from Google reCAPTCHA

Optional (for full feature testing):
- Analytics keys (Amplitude, New Relic, Segment)

**The proxy API handles CORS automatically** - no backend configuration needed! 🎉

### 3. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000/checkout](http://localhost:3000/checkout) to see the application.

**Note:** The application runs under the `/checkout` base path.

### 4. Run with HTTPS (Optional)

Some features (like Apple Pay, Google Pay, or testing secure cookies) require HTTPS. To run the dev server with HTTPS, you'll need to create local SSL certificates.

#### Install mkcert

**macOS (Homebrew):**
```bash
brew install mkcert
brew install nss  # Required for Firefox support
```

**Windows (Chocolatey):**
```powershell
choco install mkcert
```

**Linux:**
```bash
# Arch
sudo pacman -S mkcert

# Debian/Ubuntu (requires manual install)
# See: https://github.com/FiloSottile/mkcert#linux
```

#### Create Certificates

```bash
# Install the local CA in your system trust store (one-time setup)
mkcert -install

# Create the .cert directory and generate certificates
mkdir -p .cert
mkcert -key-file .cert/localhost+2-key.pem -cert-file .cert/localhost+2.pem localhost 127.0.0.1 ::1
```

#### Run with HTTPS

```bash
npm run dev:https
```

Open [https://localhost:3000/checkout](https://localhost:3000/checkout) to see the application over HTTPS.

> **Note:** The `.cert/` directory is gitignored. Each developer needs to generate their own certificates.

### CORS-Free Local Development 🚀

The app includes a built-in GraphQL proxy (`/api/graphql`) that forwards requests to the staging API. This means:
- ✅ **No CORS errors** in localhost
- ✅ **No backend changes** required
- ✅ **Same code** in dev and production
- ✅ **Cookies/auth** automatically handled

The proxy automatically activates when running on `localhost` and forwards to the API domain specified in `NEXT_PUBLIC_API_DOMAIN`.

## Development

### Available Commands

```bash
# Development
npm run dev                 # Start Next.js dev server
npm run build              # Build for production
npm run start              # Start production server

# Code Quality
npm run lint               # Run ESLint
npm run format             # Format code with Prettier
npm run typecheck          # Type check with TypeScript

# Testing
npm test                   # Run unit tests
npm run test:watch         # Run tests in watch mode
npm run test:e2e           # Run Playwright E2E tests
npm run test:e2e:ui        # Run E2E tests with UI
```

### Project Structure

```
├── src/
│   ├── app/              # Next.js App Router pages
│   ├── components/       # React components
│   ├── hooks/            # Custom React hooks
│   └── lib/              # Utilities, API clients, payment integrations
├── tests/                # E2E tests (Playwright)
└── .kiro/steering/       # Product documentation
```

### Coding Standards

- **TypeScript** - Strict mode enabled, avoid `any`
- **ESLint** - Enforced with Perfectionist plugin for import sorting
- **Prettier** - Auto-formatting on commit via lint-staged
- **Testing** - Unit tests for business logic, E2E for user flows
- **Accessibility** - WCAG AA compliance required
- **Base Path** - Always account for `/checkout` base path (see `.cursor/rules/routing-and-base-path.mdc`)

## Testing

### Unit Tests

```bash
# Run all unit tests with coverage
npm test

# Watch mode for development
npm run test:watch
```

Unit tests use Jest and React Testing Library. Place test files alongside source files with `.test.ts` or `.spec.ts` extension.

### End-to-End Tests

```bash
# Run E2E tests headless
npm run test:e2e

# Run E2E tests with UI
npm run test:e2e:ui
```

E2E tests use Playwright and are located in the `tests/` directory.

## Deployment

### Netlify

The application deploys automatically via Netlify:

- **Production:** Deploys from `main` branch
- **Preview:** Auto-generated for pull requests
- **Staging:** Branch deploys for feature branches

### Environment Variables

Configure in Netlify dashboard:

```env
# Production
NEXT_PUBLIC_ENV=production
NEXT_PUBLIC_API_DOMAIN=api.varsitytutors.com

# Staging
NEXT_PUBLIC_ENV=staging
NEXT_PUBLIC_API_DOMAIN=api.vtstaging.com
```

### Build Configuration

See `netlify.toml` for build settings. The build command is `npm run build` and publishes the `.next` directory.

## Meta Pixel / Facebook Tracking

The Meta Pixel is initialized via `MetaPixelLoader` in `layout.tsx`:

- **Pixel ID:** `NEXT_PUBLIC_META_PIXEL_ID` environment variable
- **Initialization:** `src/lib/analytics/MetaPixelLoader.tsx`
- **Event tracking:** `src/lib/analytics/checkout-tracking.ts`

Performance optimizations:
1. Captures `fbclid` immediately (0ms) - no attribution loss
2. Sets up `fbq` stub for early calls before script loads
3. Loads actual Meta Pixel script after 2s delay (non-blocking)

## Documentation

- **Product Documentation:** `.kiro/steering/product.md`
- **Cursor Rules:** `.cursor/rules/` (especially `routing-and-base-path.mdc`)
- **API Documentation:** Contact backend team

## Contributing

1. Create a feature branch from `main`
2. Make your changes following coding standards
3. Run tests and ensure they pass
4. Submit a pull request for review
5. Preview deployment will be auto-generated

### Commit Messages

Use Conventional Commits format:

```
feat: Add Apple Pay integration
fix: Resolve pricing calculation bug
docs: Update README with setup instructions
test: Add unit tests for quote manager
```

## Support

- **Team:** E-commerce Engineering
- **Slack:** #ecomm-eng
- **Issues:** GitHub Issues
- **Runbook:** Coming soon

## License

Proprietary - Varsity Tutors LLC