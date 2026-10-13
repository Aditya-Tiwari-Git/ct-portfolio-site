# Consultix approved knowledge

The executable source of truth is `src/data/`. Website pages and `server/knowledge.ts` consume these same files. This document records provenance and editorial boundaries; it is not a second runtime knowledge source.

## Sources reviewed on 10 October 2026

- User project brief: approved company positioning, services, industries, delivery approach and contact details.
- https://consultixtech.com/: confirmed Sector 144, Noida, Uttar Pradesh 201307 and +91-8447844097 / +91-8287204638. Existing site does not establish customers, certifications, delivery statistics or enterprise case studies.
- Supplied `CT Logo.png`: preserved in `public/brand/ct-logo.png`; SVG viewBox displays the original logo without its large whitespace.
- `C:\Users\adity\Downloads\Catalogue.xlsx`: reviewed all four sheets (Product Catalogue, Mobile App, Sheet3, Sheet2). The source contains internal development notes, estimates, candidate stacks and prices. The raw workbook is intentionally excluded from the public repository and frontend.

## Approved public catalogue summaries

ERP with chatbot (finance, HR/HCM, procurement, inventory, sales and production workflows); Consultix AI Chat Bot; LMS and online examination; AI-enabled ITSM; procurement; Power BI reports; organization mobile apps; voice bots; contract assessment; ticket quality assessment; sentiment analysis; inventory tracking; enterprise workflow and portal opportunities.

These are solution areas, not verified completed or generally available products. Availability, exact scope, integration feasibility, stack, prices and timelines require team confirmation. Mobile-app sheets describe proposed customer ordering, administration, inventory, delivery and analytics workflows; no completed deployment is claimed. Candidate technologies include Flutter, React Native, Node.js, PostgreSQL, Power BI and AWS/Azure, with no partnership or certified-expertise claim.

## Excluded information

Internal staff names, raw notes, development ETAs, internal costs, client-specific planning, pricing options and unfinished research entries are never included in chatbot context or public copy. No client logos, testimonials, invented clients, certifications, partnerships, revenue, employee counts, years of experience or performance statistics.

## Updating knowledge

Edit `company.ts`, `services.ts`, `solutions.ts`, `industries.ts`, `contact.ts` and editorial articles in `insights.ts`. Record provenance for each new business claim. Rebuild to update pre-rendered pages, sitemap, schema and the server bundle. Update server environment configuration for public contact email; keep secrets outside the repository.

## Retrieval and future migration

Current retrieval ranks keyword/alias matches against at most four relevant service, solution or industry sections, plus a compact company/service/contact summary. It considers the latest query and two preceding user turns. General service questions get a short capability overview. The `retrieve` interface can later use embeddings, Cloudflare Vectorize or external knowledge without changing the chat UI or `/api/chat` response shape.
