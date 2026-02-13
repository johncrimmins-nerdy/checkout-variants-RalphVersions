# Technology Stack

## Core Framework

- **Next.js 15** with App Router - React framework with SSR/SSG capabilities
- **React 19** - UI library with latest features
- **TypeScript** - Type-safe JavaScript with strict configuration

## Styling & UI

- **Tailwind CSS 4** - Utility-first CSS framework with dark mode support
- **Lucide React** - Icon library (optimized package imports)
- **Poppins Font** - Google Fonts integration
- **Framer Motion** - Animation library (implied from features)

## Database & Backend

- **Supabase** - PostgreSQL database with auth and real-time features
- **Netlify Functions** - Serverless API endpoints
- **SWR** - Data fetching with caching and revalidation
- **Zustand** - Lightweight state management with persistence

## AI & External Services

- **OpenAI GPT-4** - Primary AI service for tutoring and content generation
- **Google Generative AI** - Secondary AI service
- **Langfuse** - AI observability and analytics
- **New Relic** - Application performance monitoring

## Development Tools

- **ESLint** - Code linting with Next.js, TypeScript, and Perfectionist plugins
- **Prettier** - Code formatting
- **Stylelint** - CSS linting
- **Jest** - Unit testing
- **Playwright** - End-to-end testing

## Build & Deployment

- **Netlify** - Hosting and deployment platform
- **PWA** - Progressive Web App capabilities (currently disabled)
- **Lighthouse** - Performance monitoring

## Common Commands

### Development

```bash
npm run dev                 # Start development server with secrets
npm run dev:netlify        # Start with Netlify CLI
npm run build              # Production build
npm run build:local        # Local build with secrets
npm run start              # Production server with New Relic
```

### Testing & Quality

```bash
npm run test               # Run Jest unit tests
npm run test:e2e          # Run Playwright E2E tests
npm run test:e2e:ui       # Run E2E tests with UI
npm run lint              # ESLint with auto-fix
npm run lint:css          # Stylelint CSS files
npm run lighthouse        # Performance testing
```

### Database & Content

```bash
npm run generate:db:types     # Generate Supabase TypeScript types
npm run generate:db:schema    # Dump database schema
npm run validate:subjects     # Validate subject data
npm run sync:subjects        # Sync subjects to database
npm run generate:course-content # Generate AI course content
```

### Utilities

```bash
npm run generate:manifest    # Generate content manifest
npm run validate:content     # Validate all content
npm run export:content      # Export content for external use
```

## Configuration Notes

- Base path: `/practice-hub` (configurable via NEXT_PUBLIC_BASE_PATH)
- Strict TypeScript with unused parameter/variable checking
- ESLint uses double quotes and natural sorting
- Images are unoptimized for static deployment
- Console statements stripped in production builds
