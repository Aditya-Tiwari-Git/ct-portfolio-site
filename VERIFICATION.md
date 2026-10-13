# Verification

## Corporate UI refinement — 12 October 2026

- Updated the shared visual system across all pages: white/light backgrounds, measured typography, compact navigation, flat listings, plain icons, subtle borders and modest corner radii.
- Reordered the homepage to Hero → What We Do → Core Services → Solutions → Industries → Why Consultix → Delivery Approach → Contact CTA → Footer. Existing insights and the assistant preview remain available within the Why Consultix area; the assistant information is expandable.
- Replaced the floating AI-themed hero artwork with a flat capability overview. AI receives the same visual weight as the other technology capabilities.
- Reduced the chat launcher to a small support button and refined the existing chat panel styling. Chat logic, source links, error handling, clear/minimize controls and handoff behavior were preserved.
- Updated SVG/PNG social preview artwork to match the corporate visual direction.
- Confirmed by SHA-256 comparison that all 14 approved data/backend files in `src/data`, `server` and `functions` are unchanged. Dependencies, routing, integrations, environment configuration and application architecture were not changed.
- Production build, TypeScript checks and frontend secret scan passed. All 14 existing API tests and all 8 desktop/mobile browser tests passed, including the full 18-route sweep.
- Final Axe WCAG 2 A/AA and WCAG 2.1 AA scan reported no violations across 18 routes at 1440px and 390px (36 combinations). The expanded assistant information and chat panel were also checked. Automated accessibility testing does not replace manual assistive-technology review.
- Local review artifacts: `.qa/corporate-home-desktop.png`, `.qa/corporate-hero-desktop.png`, `.qa/corporate-home-mobile.png`, `.qa/corporate-chat-mobile.png` and `.qa/corporate-accessibility.json`.

The Lighthouse scores below belong to the original 10 October implementation and were not remeasured for this UI-only iteration.

## Original implementation — 10 October 2026

## Completed

- Production build, browser TypeScript and Cloudflare TypeScript checks passed.
- Pre-rendered 18 public routes plus `404.html`; generated unique metadata, canonicals, Organization/Service/Breadcrumb schema, sitemap and robots.txt.
- Frontend build scan passed: no API-key pattern, server credential marker or configured secret value found in text assets.
- 14 API unit tests passed, covering validation, history roles/size, retrieval, provider failure, safe errors, native limiter denial, contact consent and delivery success/failure.
- 8 Chromium browser tests passed across desktop and iPhone-sized viewports. Route sweep checked all 18 pages on each viewport, unique titles/canonicals, logo loading, horizontal overflow and hydration errors. Interaction checks covered chatbot conversation/error/clear/handoff/text injection, mobile navigation, solution filtering and contact fallback.
- Axe WCAG 2 A/AA and WCAG 2.1 AA scans passed on all 18 pages at 1440px and 390px (36 combinations); the assistant panel scan also reported no violations. Automated checks do not replace full manual assistive-technology testing.
- Local Wrangler compiled the Cloudflare Functions successfully. Real same-origin requests verified `/api/config` (200), unavailable `/api/chat` (safe 503), unconfigured `/api/contact` (explicit not-sent 503), service deep link (200) and unknown route (HTTP 404).
- Native chat rate limit: 12 local requests admitted, 13th rejected with HTTP 429. Provider absent, so admitted requests returned safe 503 without making paid model calls.
- Dependency audit reported zero vulnerabilities after updating the test runner; final production dependency audit also reported zero.
- Git ignore verification confirmed `.env`, `.dev.vars`, caches, build output, runtime state and temporary QA artifacts are excluded.

## Mobile Lighthouse

Measured against the production frontend on localhost with the default Lighthouse mobile simulation:

| Category | Score |
| --- | --- |
| Performance | 93 |
| Accessibility | 100 |
| Best practices | 100 |
| SEO | 100 |

Largest contentful paint: 2.9 seconds. Cumulative layout shift: 0. Reports are retained locally in `.qa/lighthouse-mobile.html` and `.qa/lighthouse-mobile.json`. Hosting/network conditions and future changes can affect scores; these are measurements of this build, not commercial performance claims.

## Pending external configuration

- Cloudflare CLI reports no authenticated account. No production deployment or DNS changes have been made.
- No GitHub repository target or credentials were supplied. Local Git was initialized; source and lockfile are ready to commit and push to the intended repository.
- Live OpenAI generation was not called because no API key/model was supplied. The real endpoint's unavailable behavior and SDK adapter compilation were checked; browser success and provider-failure contracts were tested with mocks. Validate model grounding and adversarial questions with the chosen model before launch.
- Enquiry webhook delivery needs the owner's configured service. The UI does not report a sent enquiry when delivery is unconfigured. Email is configurable as `CONTACT_EMAIL` but does not itself enable email delivery.
- Apex/www domain, redirect rules, HTTPS certificate issuance and preservation of email DNS records require account access and verification against the existing GoDaddy/Cloudflare zone.

See `README.md` for setup, secrets, rate limiting, knowledge maintenance, contact delivery and DNS migration.
