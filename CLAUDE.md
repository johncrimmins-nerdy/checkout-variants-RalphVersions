# Claude Code helper - Student Experience UI

Concise guide for using Claude Code effectively in this repo. Aligns with Anthropic best practices: https://www.anthropic.com/engineering/claude-code-best-practices

## Project quick facts

- Framework: Next.js 15, React 19, TypeScript, ESM ("type": "module")
- Node: 22+ (see package.json engines)
- App dir: src/app (global layout: src/app/layout.tsx)
- Path alias: @/ -> src/
- Telemetry: @blueshift-ui/telemetry via local helpers and provider (src/app/TelemetryProvider.tsx)

## Setup

```bash
cp env.example .env.local   # do not commit secrets
nvm use                     # Node 22
npm install
```

## Common commands

```bash
# Dev
npm run dev                 # Next dev
npm run dev:with-secrets    # Uses bin/with-secrets (AWS Secrets Manager)
npm run dev:netlify         # Netlify dev wrapper

# Build & start
npm run build               # Next build
npm run build:local         # Build with secrets loaded
npm start                   # Starts with New Relic ESM loader

# Quality
npm run lint                # ESLint + Prettier write
npm test                    # Typecheck + lint + Jest

# E2E & a11y
npm run test:e2e            # Playwright
npm run test:e2e:ui         # Playwright UI
npm run lighthouse          # LHCI autorun

# Content/data utilities (secrets required)
npm run generate:manifest
npm run validate:subjects
npm run upload:subjects
npm run generate:worksheets
npm run export:content-manifest
npm run export:content
npm run update:practice-test-names
npm run generate:db:types
npm run generate:db:schema
```

## Testing

- Unit: Jest + React Testing Library, config at jest.config.ts, setup at src/test/setup.tsx
- JSDOM env with @/ alias. Coverage output at coverage/
- E2E: Playwright specs live in tests/
- **Core Web Vitals**: Lighthouse CI runs on every PR (except dependabot)
  - Does not block merge (informational only, for now)
  - Error thresholds: CLS > 0.1, TBT > 200ms
  - Warning thresholds: FCP > 2s, TTI > 4s, LCP > 2.5s
  - Tests dashboard page on both staging and ephemeral deploy preview
  - Results posted to PR comments (~2-3 min)

## Test Writing Protocol (MANDATORY)

When writing ANY tests, you MUST follow this sequence:

### ✅ REQUIRED WORKFLOW:

1. Write the tests - Create comprehensive test coverage
2. Mock externals - Import the external, mock it with `jest.mock` and then assign a mocked variable `const mockedUseFunc = useFunc as jest.Mock`
3. Run the tests - Execute `npm test -- --testPathPatterns=filename.test.ts`
4. Verify all tests pass - Fix any failing tests before proceeding
5. Verify linting and TypeScript - Fix any type errors and lint errors
6. Check for any console errors and warnings - Test output should be clean with no warnings or polluted logs
7. Only then mark task as complete

### ❌ NEVER DO:

- Write tests without running them
- Ignore linting errors or warnings
- Mark tests as "complete" with failing tests
- Skip the verification step
- Use the `any` type (prefer strict typing or `unknown`)

### 🎯 Quality Standards:

- Aim for high coverage where practical
- Include edge cases, error handling, and function reference stability
- Use mocking strategies for external libraries and APIs
- Follow React Testing Library best practices with `render`, `renderHook`, `act()` and `screen`
- Use `@testing-library/user-event` for event-driven testing

## Linting & formatting

- ESLint flat config: eslint.config.js (TS + Next + react-hooks + perfectionist)
- Perfectionist rules are warnings for better AI ergonomics
- Prettier runs via npm run lint and lint-staged on commit

## Accessibility (WCAG AA)

- Semantics first: use native elements; add ARIA only when needed. Prefer `button`, `a[href]`, `label`/`input`, `ul`/`li`, `table` with proper headers.
- Accessible names: interactive controls must have a programmatic name (visible text, `aria-label`, or `aria-labelledby`).
- Keyboard: all interactive elements focusable; logical tab order; Enter/Space activate; Escape closes dialogs/menus; no keyboard traps.
- Focus: show focus visibly; manage focus on dialogs/menus (move focus in, restore on close); avoid `tabindex>0`.
- Contrast: meet WCAG AA (text 4.5:1; large text 3:1). Do not rely on color alone to convey meaning.
- Motion: respect `prefers-reduced-motion`; provide pause/stop for animations; avoid autoplaying disruptive motion.
- Forms: associate labels; use `aria-describedby` for help/error; set `aria-invalid` on error; group with `fieldset`/`legend`.
- Media & images: meaningful `alt`; decorative `alt=""`; captions for video; no autoplay audio.
- Headings & landmarks: single `h1`; logical heading order; use `main`, `nav`, `header`, `footer`, `aside`.
- Components: use `button` for actions and `a[href]` for navigation; avoid clickable `div/span`; toggles expose state (`aria-pressed` or `role="switch"`).
- Dialogs/menus: trap focus inside while open; restore focus on close; close with Escape and overlay click when appropriate; set `aria-modal` and `role="dialog"`.

Required checks for PRs:

- Run `npm run test:e2e` and fix Critical/Serious violations
- No new Axe Critical/Serious issues; Moderate/Minor require a rationale or follow-up ticket.
- Ensure keyboard navigation and focus management work in new/changed components.

## Performance (Core Web Vitals)

Lighthouse CI automatically tests Netlify deploy previews on every PR:

**Error Thresholds** (informational only, does not block merge):

- Cumulative Layout Shift (CLS) > 0.1
- Total Blocking Time (TBT) > 200ms

**Warning Thresholds** (informational only):

- First Contentful Paint (FCP) > 2s
- Time to Interactive (TTI) > 4s
- Largest Contentful Paint (LCP) > 2.5s

**How it works:**

- Waits for Netlify deploy preview to complete
- Tests dashboard page on both staging and ephemeral deployments
- Posts comparison results to PR comments (~2-3 min total)
- No local build required!

To run locally against a deployed URL:

**For public pages (e.g. `/subjects/sat`):**

```bash
npm install -g @lhci/cli@0.15.1 lighthouse@13.0.0 puppeteer@23.9.0
lhci autorun --collect.url="https://your-deploy-url.com/subjects/sat" --collect.settings.chromeFlags="--no-sandbox"
```

**For authenticated pages (e.g. `/dashboard`, as tested in CI):**

```bash
lhci autorun --collect.url="https://your-deploy-url.com/dashboard" \
  --collect.settings.chromeFlags="--no-sandbox" \
  --collect.puppeteerScript="path/to/login-script.js"
```

> **Note:** The Puppeteer script must handle login and navigation. See the login script in the workflow for reference.

## Telemetry (Blueshift)

- Provider is wired; use helpers on the client only.
- Page views: wrap each route once with ViewTrack from @/components/analytics/ViewTrack; pass a path-based label built via buildLabel().
- Interactions: useAnalytics() from @/lib/analytics/hooks/use-analytics and call: void analytics.track(action, { category, label?, value? }).
- Keep labels short, kebab-case, derived from path segments; prefer stable ids (slugs).
- Do not block UI awaiting telemetry; avoid duplicate page-view events.

## Environment & secrets

- Local env in .env.local. For AWS-backed secrets, run via bin/with-secrets.
- Notable vars: NEXT_PUBLIC_BASE_PATH, Supabase vars (tests).

## Directory highlights

- src/app/\*: Routes, layouts, analytics provider, middleware
- src/components/\*: Reusable UI (Lucide icons only)
- src/hooks/_, src/lib/_: Business logic, analytics, data helpers
- src/store/\*: Zustand stores
- scripts/\*: data/content import/export and maintenance scripts

## Code style & conventions

- ESM imports/exports only. Use the @/ alias.
- TypeScript throughout; avoid any. Prefer interfaces over types.
- React: functional components + hooks, stable deps, guard clauses.
- Imports: components/classes before hooks/helpers; alphabetical by import name.
- Commits: Conventional Commits (e.g., feat: ..., fix: ...).

## Claude Code usage tips

- Keep this file lean; use # in Claude Code to append refined instructions you want persisted.
- Use /clear between unrelated tasks to keep context focused.
- Consider git worktrees for parallel, independent tasks.
- Have gh CLI installed for PRs and issue flows.

### Suggested tool allowlist (adjust per team policy)

- Edit (always allow)
- Bash(npm _), Bash(npx _), Bash(playwright _), Bash(lhci _)
- Bash(git status), Bash(git add _), Bash(git commit:_), Bash(git diff)

### Headless mode examples

```bash
# Run a focused prompt non-interactively
claude -p "Analyze failing Jest test output in coverage/ and suggest fixes" --output-format stream-json

# Migration fan-out skeleton
claude -p "Refactor file X to use useAnalytics + ViewTrack; return OK/FAIL" --allowedTools "Edit Bash(git commit:*)"
```

## Gotchas

- Respect NEXT_PUBLIC_BASE_PATH when constructing URLs.
- Telemetry is client-only; never fire in SSR paths.
- Console logs are stripped in production builds; prefer telemetry or proper error handling.

## Session date/time handling

- Always present session dates/times in the student timezone, with browser timezone as fallback: use `useStudentTimezone()`.
- For display, use `formatInTimezone(dateOrISO, timezone, pattern)`.
  - Time: `formatInTimezone(isoUtc, tz, "h:mm a")`
  - Date (grouping): `formatInTimezone(isoUtc, tz, "yyyy-MM-dd")`
- For selection/editing, treat inputs as local times in the student's timezone and convert to UTC before API calls:
  - Build UTC ISO from date + time using `createDateInTimezone(...)` or `convertToUTCDatetime(dateISO, time12h, timezone)`.
- For validation, use `isDateTimeInPast(dateISO, timeISO?, timezone)`.
- Do not use `toLocaleTimeString`/`toLocaleDateString` for schedule UI—this may show browser time instead of the student time.

## Debugging checkout errors

### NewRelic entity names
- **Browser app**: `checkout-app pr` (production), `checkout-app st` (staging)
- **Backend GraphQL**: `vt-ecom-flow pr` / `vt-ecom-flow st`

### Key NRQL queries

**Browser-side JavaScript errors** (shows error message, user agent, location):
```sql
FROM JavaScriptError SELECT * WHERE appName = 'checkout-app pr' AND errorMessage LIKE '%Checkout%' SINCE 1 day ago LIMIT 20
```

**Server-side logs with full error context** (includes `error`, `error_name` in context):
```sql
FROM Log SELECT message WHERE message LIKE '%CheckoutPage%Checkout details error%' SINCE 1 day ago LIMIT 20
```

**Find errors for a specific lead/quote**:
```sql
FROM JavaScriptError SELECT * WHERE appName = 'checkout-app pr' AND pageUrl LIKE '%lead_id=YOUR_LEAD_ID%' SINCE 7 days ago
```

### Error logging architecture

1. **Server-side errors** (`page.tsx`, `welcome-back/page.tsx`):
   - Caught in try/catch, logged via `console.error('[CheckoutPage] Checkout details error:', { context, message })`
   - Full error context (including underlying `error` and `error_name`) available in server logs
   
2. **Browser-side errors** (`JavaScriptError` in NewRelic):
   - Only captures `errorMessage` (the Error.message) and stack trace
   - Custom `context` properties on errors are NOT automatically captured
   - To see full context, check server-side logs

3. **Explicitly tracked errors** (`trackErrorWithContext`):
   - Uses `window.newrelic.noticeError()` with context as custom attributes
   - Only for `IntegrationError` and `SystemError` types

### Common issues

- **"Cannot convert argument to a ByteString"**: Cookie contains non-ASCII characters (smart quotes, emoji). Fixed by sanitizing cookie values.
- **"Checkout details fetch failed"**: Network error during GraphQL fetch. Check server logs for `error_name` (e.g., `TypeError`, `AbortError`).

## References

- Anthropic best practices for agentic coding: https://www.anthropic.com/engineering/claude-code-best-practices
- Local docs: README.md, docs/troubleshooting.md
