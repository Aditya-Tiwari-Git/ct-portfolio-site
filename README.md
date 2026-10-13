# Consultix Technologies

A complete React + TypeScript + Vite corporate website, with Tailwind CSS, Motion, Lucide icons, React Router, pre-rendered public routes and Cloudflare Pages Functions. The site uses the supplied logo and approved public descriptions from the project brief, existing website and reviewed catalogue.

## Local development

Use Node.js 22.12+ (Node 24 recommended) and npm. On Windows PowerShell, use `npm.cmd` / `npx.cmd` if execution policy blocks `.ps1` launchers.

```sh
npm install
cp .env.example .env
cp .env.example .dev.vars
npm run dev:full
```

Open **http://127.0.0.1:8788**. `dev:full` builds and runs the real Cloudflare runtime, including `/api/chat`, `/api/contact` and `/api/config`. For hot frontend updates, keep that runtime running and, in another terminal, run `npm run dev` (http://127.0.0.1:5173). Vite proxies `/api` to port 8788. Rebuild and restart `dev:full` after server/content changes if Wrangler does not detect them.

PowerShell copies:

```powershell
Copy-Item .env.example .env
Copy-Item .env.example .dev.vars
npm.cmd run dev:full
```

`npm run preview` previews frontend assets only. It does not execute Pages Functions. Missing API configuration returns an honest unavailable message and contact handoff; it never simulates a live AI answer.

## Environment variables

`.env` is used by Vite and pre-rendering; `.dev.vars` is read by local Cloudflare Functions. Both are ignored by Git. Production runtime values belong in Cloudflare Pages settings. Do not place secrets in `VITE_*` variables or tracked configuration.

| Variable | Purpose |
| --- | --- |
| `OPENAI_API_KEY` | Server-only OpenAI credential. Put in `.dev.vars` locally and encrypted Cloudflare secret in production. |
| `OPENAI_MODEL` | Model available to your OpenAI account that supports the Responses API. Required; no model is hardcoded. Set it as a Pages runtime secret/environment binding in Cloudflare (see deployment steps). |
| `AI_PROVIDER` | `openai`; provider dispatch lives in `server/provider.ts`. Add an adapter there to support another provider. |
| `SITE_URL` | Canonical build URL; defaults to `https://consultixtech.com`. Set the same URL for build and runtime. |
| `CONTACT_EMAIL` | Your approved **public** business email. Put in `.env` and rebuild to publish it. Put in `.dev.vars` / production environment to serve it dynamically. This value is intentionally public; use a business contact address. |
| `CONTACT_PHONE_PRIMARY` | Runtime public phone; defaults to +918447844097. |
| `CONTACT_PHONE_SECONDARY` | Runtime public phone; defaults to +918287204638. |
| `WHATSAPP_NUMBER` | Runtime public WhatsApp number, digits only; defaults to 918447844097. |
| `CONTACT_WEBHOOK_URL` | Optional HTTPS enquiry delivery endpoint. Store as a server secret. |
| `CONTACT_WEBHOOK_TOKEN` | Optional bearer credential for delivery endpoint. Store as a server secret. |
| `ALLOW_LOCAL_RATE_LIMIT` | `true` enables an optional in-memory limiter **only on localhost**. It has no effect on production enforcement; missing production bindings do not block either API. |

The homepage/footer and pre-rendered schema use approved contacts in `src/data/contact.ts`. If phone numbers change, update this file as well as runtime overrides and rebuild. `.env` alone does not configure a deployed server or send email. `CONTACT_EMAIL` displays an address; configure the webhook below for form delivery.

## Contact form delivery

The form validates name, email, company, service, requirements, contact preference and consent. Phone is required when the preferred channel is Phone or WhatsApp. Server validation adds field size limits, a honeypot, same-origin checks and optional rate limiting.

Configure a trusted HTTPS endpoint in `CONTACT_WEBHOOK_URL` that accepts JSON and returns a 2xx status **after accepting delivery**. It can be your CRM, an automation workflow or your own email service adapter. Optional `CONTACT_WEBHOOK_TOKEN` is sent as a bearer token. Payload:

```json
{
  "source": "consultix-website",
  "name": "Visitor name",
  "email": "visitor@example.com",
  "company": "Visitor organization",
  "phone": "",
  "service": "AI & Intelligent Automation",
  "requirements": "Visitor-supplied project context",
  "preferred": "Email",
  "consent": true
}
```

The frontend reports success only after confirmation. When delivery is unconfigured or fails, it explicitly states that the enquiry was not sent and offers a WhatsApp link. Only a concise service topic is included in that link, not the visitor’s email, phone or detailed requirements. The visitor must click before WhatsApp opens. A network timeout can mean delivery status is uncertain; the UI asks visitors to contact the team before submitting again.

## AI chatbot architecture

```text
Visitor → lazy-loaded chat panel → POST /api/chat
        → same-origin / byte-size / history validation + optional rate limiting
        → shared approved content + ranked relevant sections
        → server-only OpenAI Responses API → plain-text reply + source links
```

The official OpenAI SDK is called exclusively in `server/provider.ts`, with `responses.create`, `store: false`, a configured model, 700 output tokens, a 20-second timeout and no automatic retries. The browser request times out after 25 seconds. No LLM secrets or system instructions are shipped in frontend assets. See the [official OpenAI quickstart](https://developers.openai.com/api/docs/quickstart).

Chat state stays in browser memory, clears on reload or through Clear conversation, and is not permanently stored by this application. Requests carry at most 12 alternating messages (the UI sends at most 11), 1,500 characters per user message, 5,000 per assistant message and 16,000 aggregate characters. Streaming request reads cap the payload at 24 KB even without Content-Length.

Retrieval ranks structured service, solution and industry sections, using query aliases and recent user turns. It sends at most four relevant sections alongside a compact company/contact/capability summary; broad service questions receive a short overview. `server/knowledge.ts` can be replaced with embeddings/Vectorize later without changing the frontend API.

The server instructions restrict the assistant to Consultix, require explicit uncertainty for unconfirmed facts, limit discovery to useful progressive questions, and treat retrieved/user/history content as data. There are no execution tools. Responses render as React text, never HTML. Source links are restricted to local approved paths. These measures reduce prompt-injection risk; model behavior still requires review with representative and adversarial questions before a public launch.

AI-generated content can be wrong. The chat displays a privacy notice and the site explains provider processing. `store: false` does not override the provider’s retention obligations or guarantee zero retention. No application logging of conversation contents or optional analytics trackers is implemented.

## Rate limiting and abuse protection

The checked-in Cloudflare Pages configuration contains **no `unsafe` or native limiter bindings**. Rate limiting is optional for this initial low-traffic deployment. If `CHAT_RATE_LIMITER` or `CONTACT_RATE_LIMITER` is absent, `rateLimit()` allows the request to continue; missing bindings do not produce a 503 or prevent chat/contact processing. The shared `Env` interface retains these optional fields for a future limiter adapter. If an explicitly supplied limiter rejects a request, the API returns 429; if that configured service fails, it returns a safe 503.

For local development, `ALLOW_LOCAL_RATE_LIMIT=true` activates the existing in-memory limits (12 chat requests/IP/minute, 3 contact requests/IP/minute) only on localhost. Production does not silently use isolate-local memory as distributed protection. **Without a production upgrade, there is no application-level rate enforcement on the deployed Pages APIs.** Same-origin restrictions, JSON validation, streaming byte-size limits, message/history limits, contact consent/honeypot checks, provider timeout and safe errors remain in place.

Recommended production upgrades:

1. Add Cloudflare zone-level WAF/rate-limiting rules targeting POST requests to `/api/chat` and `/api/contact`, with limits appropriate for your expected traffic and available plan. Those rules apply to traffic through the configured zone; separately restrict or protect the default `*.pages.dev` hostname so it cannot bypass your custom-domain policy.
2. For enforcement across all hostnames, add a Pages-compatible shared limiter service, backed by a Durable Object in a separate Worker or another distributed store. A plain KV counter is not a strict atomic limiter. Alternatively move the API to a Worker that supports native `ratelimits`; keep credentials server-side and preserve the existing API contracts.
3. Monitor OpenAI usage and configure available account/project budgets and alerts. A per-IP limiter is not a global spending cap, and distributed clients can use multiple IPs.

Native Worker configuration must not be copied into `wrangler.toml` for Pages. See [Cloudflare rate limiting](https://developers.cloudflare.com/workers/runtime-apis/bindings/rate-limit/) and [Pages configuration](https://developers.cloudflare.com/pages/functions/wrangler-configuration/).

## Updating knowledge and content

| Source | Used for |
| --- | --- |
| `src/data/company.ts` | Positioning, company information, principles and delivery approach |
| `src/data/services.ts` | Six service detail pages and assistant service context |
| `src/data/solutions.ts` | Filterable catalogue-derived solution areas and assistant context |
| `src/data/industries.ts` | Six industry opportunity areas |
| `src/data/contact.ts` | Approved contact details and WhatsApp helper |
| `src/data/insights.ts` | Original editorial articles; not case studies |
| `src/data/routes.ts` | Metadata, pre-render paths and sitemap entries |
| `knowledge/consultix-knowledge.md` | Provenance, exclusions and editorial rules |

Do not publish internal catalogue notes, prices or development estimates. The reviewed catalogue does not establish finished product availability. Do not add customers, certifications, partnerships, statistics or testimonials without an approved source. To add a service, add its structured record; the existing `/services/:slug` route, cards, metadata, sitemap and assistant consume it. Add explicitly routed page metadata to `routes.ts` when creating a new standalone page.

## SEO and performance

The build generates real HTML for 18 public routes plus `404.html`, unique titles/descriptions, canonicals, Open Graph/Twitter tags, Organization/Service/Breadcrumb schema, `sitemap.xml` and `robots.txt`. Cloudflare serves these static routes; only `/api/*` invokes Functions. Having `404.html` makes unknown paths return an actual HTTP 404 on Pages. No catch-all redirect masks missing pages.

Manrope fonts are self-hosted. Technology and article illustrations use lightweight code/SVG/CSS rather than stock photos. Chat code is loaded only when opened. Hashed assets receive long-lived immutable caching. Motion respects reduced-motion preferences. Contact controls have labels and browser/server validation; chat has keyboard focus handling, a message log, status/error announcements and safe text rendering.

The supplied full logo is preserved. Its large original whitespace is removed **for display** through an SVG viewBox containing the original bitmap. No replacement logo or customer marks are introduced.

`public/_headers` applies CSP and browser security headers to static assets. API responses set JSON type, no-store and nosniff in server code. If adding integrations or analytics, review CSP and privacy disclosures instead of broadly weakening the policy. The social preview uses a 1200×630 PNG rendered from the original code-based artwork in `public/og-image.svg`.

## Validation

```sh
npm run typecheck
npm test
npm run build
npx playwright install chromium
npm run test:e2e
npx wrangler pages functions build --outdir .wrangler/build
```

The build automatically pre-renders pages and scans `dist` for API key patterns, server credential names and locally configured secret values. Unit tests cover request bounds, history roles, relevance, missing configuration, provider failures, rate limiting and verified enquiry delivery. Browser tests cover all routes and metadata, logo loading, viewport overflow, mobile navigation, chatbot success/error/clear/handoff, text injection, filters and contact fallback. Live model response quality needs your own configured key/model; mocks verify transport/UI contracts but do not prove model grounding.

## GitHub and Cloudflare Pages deployment

1. Create or choose your GitHub repository. Commit the source and lockfile; confirm `.env`, `.dev.vars`, `.npm-cache`, `.wrangler` and credentials are excluded. Push to your chosen branch. No production repository or account was assumed.
2. In Cloudflare, open Workers & Pages → Create application → Pages → Connect to Git. Authorize the intended GitHub repository.
3. Configure build command `npm run build`, output directory `dist`, root directory the repository root, and a current Node version (24 recommended). Use the checked-in `wrangler.toml` as the runtime configuration source.
4. `SITE_URL` and `AI_PROVIDER` have configurable defaults in `[vars]` of `wrangler.toml`. Because this file is the Pages configuration source of truth, update those defaults in the file when changing deployment configuration. Set `SITE_URL` and the approved public `CONTACT_EMAIL` in the build environment as needed. Keep preview and production settings separate.
5. Add encrypted **server secrets** `OPENAI_API_KEY` and `OPENAI_MODEL` in Pages project settings → Variables and Secrets. Although a model ID is not confidential, storing it as a runtime secret binding keeps it configurable in Cloudflare without adding a placeholder to the required Wrangler `[vars]` configuration. The model must be available to your own OpenAI account. Also configure optional `CONTACT_WEBHOOK_URL`, `CONTACT_WEBHOOK_TOKEN` and runtime `CONTACT_EMAIL` as needed. Never use a `VITE_` prefix. Re-deploy after configuration changes; missing key/model still produces the intentional friendly provider-unavailable response.
6. Deploy and verify the generated `*.pages.dev` URL. Test `/api/chat` from the same origin, enquiry delivery, service deep links, sitemap and actual 404. Limiter bindings are not required. Before increasing traffic, implement the production rate-limiting upgrade above and verify its enforcement.
7. Connect the custom domain only after the preview is ready. No account credentials, production API keys or DNS modifications are bundled with this project.

For a new local repository, after creating your chosen GitHub repository:

```sh
git add .
git commit -m "Build Consultix corporate website and AI assistant"
git branch -M main
git remote add origin YOUR_GITHUB_REPOSITORY_URL
git push -u origin main
```

Replace the repository URL with your actual target. If connecting to an existing repository, follow its branch and review workflow instead of overwriting its history. The checked results and remaining external configuration are recorded in `VERIFICATION.md`.

CLI option for an authenticated Cloudflare account:

```sh
npx wrangler login
npx wrangler pages project create consultix-technologies
npx wrangler pages secret put OPENAI_API_KEY --project-name consultix-technologies
npx wrangler pages secret put OPENAI_MODEL --project-name consultix-technologies
npm run deploy -- --project-name consultix-technologies
```

The secret commands prompt for values; do not put API credentials in command arguments. You can set these secret bindings in the dashboard instead. If using Git integration, create that integration first; project creation mode cannot always be switched later. Pages static hosting and Functions have plan limits. OpenAI API usage is billed separately and is not included in free hosting.

## GoDaddy domain and DNS

1. Export or record **all current DNS entries**, including A/AAAA/CNAME, MX, SPF TXT, DKIM selectors, DMARC TXT, verification TXT and SRV records. Identify the current email provider and compare the records with its published configuration.
2. Add `consultixtech.com` as a zone in Cloudflare. Let it scan DNS, then compare every entry against the saved source. Manually add records omitted by the scan. Keep mail host records DNS-only unless your email provider explicitly instructs otherwise.
3. If migrating authoritative DNS to Cloudflare, obtain the two exact assigned Cloudflare nameservers. In GoDaddy domain management, update nameservers to those assigned values. Coordinate existing DNSSEC/DS configuration as instructed by the providers; stale DS records can break resolution. Verify the imported email records **before** changing nameservers.
4. Wait for Cloudflare to mark the zone active. Check authoritative DNS and test inbound/outbound email. Do not delete or overwrite MX/SPF/DKIM/DMARC records to connect the website.
5. In Pages → your project → Custom domains, add `consultixtech.com`. Follow Cloudflare’s generated record instructions; let Pages provision the website record after checking it does not affect mail records. Do not just point a DNS record at Pages without adding the custom domain in the project.
6. Add `www.consultixtech.com` to the same project. Follow the provided CNAME instructions. Resolve existing conflicting website records only after verifying their purpose.
7. Create a Cloudflare redirect rule for hostname `www.consultixtech.com` to `https://consultixtech.com` preserving path and query, with HTTP 301. Keep apex as canonical. Consider redirecting the production Pages hostname to the canonical domain while leaving preview deployments accessible for review.
8. Confirm HTTPS certificates are active for apex and www. Use Full (strict) when applicable and enable HTTP→HTTPS once certificates are valid. Test homepage, deep links, API calls and redirect loops.
9. Re-check MX, SPF, DKIM and DMARC against the original snapshot and test email again. Website migration must not remove email configuration.
10. Submit the sitemap in your search console and check canonical URLs after launch.

If you keep authoritative DNS outside Cloudflare, subdomain CNAME integration may be possible; apex Pages integration generally requires the Cloudflare zone workflow. Follow [Pages custom-domain documentation](https://developers.cloudflare.com/pages/configuration/custom-domains/) for your selected approach.

## Troubleshooting

- **PowerShell says scripts are disabled:** use `npm.cmd` and `npx.cmd`; no execution-policy change is needed.
- **Chat unavailable:** verify server secrets, an accessible Responses-compatible model and the server runtime. Native limiter bindings are optional and their absence does not disable the API. Vite alone cannot run Functions. Do not add browser API keys as a workaround.
- **Chat returns 503 immediately after adding credentials to `.env`:** this project has a `.dev.vars` file, which is the local Cloudflare runtime's server configuration. Set `OPENAI_API_KEY` and `OPENAI_MODEL` in `.dev.vars` as well; populating `.env` alone does not populate those bindings. Preserve other existing `.dev.vars` settings, then stop and restart `npm run dev:api` (or `npm run dev:full`). Both credential files are ignored by Git. An immediate configuration failure uses the same safe browser message as other provider failures.
- **Chat 429:** an enabled local limiter, optional configured limiter, edge rule or provider limit is rejecting requests. Wait as indicated by `Retry-After`. The initial production Pages deployment has no application-level limiter unless you add one.
- **Chat 400/413:** check message size/history limits and JSON payload; the UI sends whole alternating pairs.
- **Email missing:** set `CONTACT_EMAIL` in `.env` and rebuild/restart, or in the Cloudflare runtime environment and redeploy. `.env` is ignored by Git and is not automatically uploaded.
- **Form offers WhatsApp:** no working delivery endpoint is configured, the endpoint rejected the enquiry, or delivery could not be confirmed. Displaying an email is not an email delivery integration.
- **Deep link 404:** confirm the full `dist` folder was deployed after pre-rendering. The dashboard output must be `dist`.
- **Build cannot access parent directories in a restricted Windows sandbox:** dependency resolution may require the environment’s reviewed build permission. Do not relocate or delete unrelated project files.
- **No API route after upload:** use Pages Git integration or Wrangler deployment, which compile `functions/`. A static drag-and-drop of `dist` alone does not publish Functions.

Privacy and terms text describes this implementation and should be reviewed by the business against its actual provider and enquiry retention practices before publication.
