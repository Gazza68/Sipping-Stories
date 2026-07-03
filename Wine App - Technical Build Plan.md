# Sipping Stories — Technical Build Plan

*Architecture, stack and build sequence for a solo, AI-assisted, bootstrap build*

Prepared for Garron Botha  |  July 2026  |  Draft v1.0

## 1. Principles

- **Modular by design (your requirement):** independent modules behind clear interfaces — each can be built, fixed and replaced on its own. One database, one auth system, many small features.
- **Boring technology, exciting product:** managed services everywhere. As a solo AI-assisted builder, your scarce resource is attention, not compute.
- **Buy/borrow before build:** free LWIN wine data, Claude vision for label reading, Supabase for the entire backend. Custom code only where the product is differentiated: the Wine Brain and the winery loop.
- **AI-assisted workflow:** build with Claude Code against a written spec per module (this document is the master spec). Every module gets: schema → API → UI → tests, committed to Git from day one.

## 2. Stack

| **Layer** | **Choice** | **Why** |
| --- | --- | --- |
| Mobile app | React Native + Expo (TypeScript) | One codebase for iOS/Android; Expo handles builds, updates (OTA), push notifications; best-supported stack for AI-assisted coding. |
| Backend | Supabase (managed Postgres) | Auth, database, file storage, edge functions, row-level security in one free-tier service. Postgres scales far beyond this app's needs. |
| Vector store | pgvector (inside Supabase) | Your notes ask for a vector database — pgvector gives embeddings search inside the same Postgres DB. No extra service, joins palate vectors directly to user rows. |
| AI | Claude API (Haiku for classification/extraction, Sonnet for Brain chat) | Vision for label scanning, chat for the Brain, embeddings via a small embedding model. Structured outputs for data extraction. |
| Winery dashboard | Next.js web app (Vercel free tier) | Wineries live on laptops; a web dashboard ships faster than more app screens. |
| Wine data | LWIN database (Liv-ex, free CC licence, 200k+ wines) | Backbone identity for wines; enrich per-region manually + via AI. Defer paid APIs (Wine-Searcher ≈ per-query cost) until revenue. |
| Analytics | PostHog (free tier) | Funnels, retention, feature flags. |
| Payments | RevenueCat + store billing (consumer); Stripe (winery SaaS) | RevenueCat abstracts App Store/Play billing; Stripe invoices wineries. No wine payments in v1. |

**Estimated running cost:** £0–15/mo until ~1,000 MAU, then £30–80/mo. AI is the main variable cost — see §6.4.

## 3. Architecture

Three clients, one backend, five modules:

- **Clients:** consumer app (Expo), winery dashboard (Next.js), public Kent Wine Index website (same Next.js project — SEO/waitlist asset that reads the same wines/wineries tables), admin panel (Supabase Studio + a few internal pages).
- **Backend:** Supabase Postgres with row-level security as the single source of truth; edge functions for AI orchestration (label scan, Brain chat, recommendation refresh); scheduled jobs for digests and knowledge-base ingestion.
- **Modules (independent, in build order):** M1 Identity & Profiles → M2 Wine Journal → M3 Wine Brain → M4 Recommendations → M5 Winery Platform. Each module = its own tables, edge functions, and screens; later modules read earlier ones through views, never write into them.

### 3.1 Core data model

| **Table** | **Key fields** | **Notes** |
| --- | --- | --- |
| users / profiles | auth id, name, email, dob (age gate), region, onboarding answers | Supabase Auth; RLS: users see only their rows |
| wines | lwin\_id (nullable), producer, name, vintage, style\_tags[], region, abv, price\_band, pairing\_tags[], occasion\_tags[], organic/biodynamic flags, soil\_type, story, wow\_factor | Seeded from LWIN + winery-provided + user-generated; dedupe by LWIN then fuzzy match. Fields mirror the real purchase-decision factors: taste, price, pairing, occasion, story, region, grape, style, vintage, abv, organic, soil |
| tastings | user\_id, wine\_id, rating (1–5), note, photo\_url, location, occasion, created\_at | The journal — the app's most valuable table |
| palate\_profiles | user\_id, style\_vector (pgvector), price\_band, adventurousness, updated\_at | Recomputed nightly from tastings + quiz |
| wineries | name, story, geo, style\_tags[], owner\_user\_id, tier | Winery-editable via dashboard |
| winery\_wines / releases / events | winery\_id, wine\_id, drop\_date, rsvp counts | Powers clubs, drops, pickup parties |
| follows | user\_id, winery\_id, source (qr/search), created\_at | The loop's connective tissue |
| kb\_documents / kb\_chunks | source, text, embedding (pgvector), region\_tags | Wine Brain knowledge base (RAG) |
| brain\_messages | user\_id, role, content, cost\_tokens | Chat history + cost tracking |
| referrals | user\_id, winery\_id, wine\_id, clicked\_at, converted, value | Phase 3 commission attribution |

## 4. The Wine Brain (the differentiator)

### 4.1 What it is

A retrieval-augmented chat agent, per user, with three context sources merged at query time: (1) the user's palate profile and journal (their wines, ratings, notes), (2) a curated wine knowledge base (RAG over kb\_chunks via pgvector), (3) platform wineries' current releases and events. System prompt enforces the personality: warm, plain-language, never snobby, always suggests a next step, never encourages volume.

### 4.2 Answer to your notes: “How can I link Claude with Perplexity to build a knowledge base?”

You don't need Perplexity specifically — you need a research-and-ingest pipeline. Practical version:

- A scheduled job (weekly) runs Claude with web search over a fixed source list (regional wine bodies, WineGB/SAWIS, producer sites, beginner education topics).
- Claude extracts clean, attributed summaries into kb\_documents (source URL, date, region tags).
- Chunks are embedded and stored in pgvector; old versions superseded, so the Brain stays current on trends and news.
- You review a weekly diff (10 minutes) — human-in-the-loop keeps quality and copyright hygiene.

The same pipeline later powers the consumer “wine trends & news” feed and winery market-trend panels — one ingestion system, three features.

### 4.3 Label scanning

Photo → Claude vision with a structured-output prompt (producer, wine name, vintage, region, style guesses) → fuzzy match against wines table (LWIN + previous user entries) → confirm screen. No custom computer vision; accuracy target 80% on real bottles, with search-as-fallback. Cache scans by image hash.

### 4.4 Cost control

- Haiku for extraction/classification; Sonnet only for Brain chat. Cap free-tier chat (e.g. 20 messages/mo); Premium removes the cap.
- Cache common Q&A embeddings; track cost\_tokens per user; alert if cost/MAU > £0.10/mo.

## 5. Module Build Plan (with AI-assisted workflow)

Each module is 2–5 weekends of work with Claude Code. Definition of done: schema migrated, RLS tested, screens working on both platforms, analytics events firing.

| **Module** | **Scope** | **Est. effort** |
| --- | --- | --- |
| M0 Skeleton | Repo, Expo app shell, Supabase project, auth, CI (EAS builds), design tokens | 1–2 weekends |
| M1 Identity | Signup/login, age gate, onboarding taste quiz, profile screen | 2 weekends |
| M2 Journal | Camera capture, label scan pipeline, wine search/add, rating + notes, history list | 3–4 weekends |
| M3 Wine Brain | KB ingestion pipeline, RAG chat, palate profile job, chat UI with suggested prompts | 3–4 weekends |
| M4 Recommendations | Nightly rec job (rules + vector similarity), rec feed screen, “why this” explanations | 2 weekends |
| M5 Winery platform | Next.js dashboard, winery profiles in-app, QR deep links, follows, push announcements, weekly digest email | 4–5 weekends |
| M6 Monetization | RevenueCat premium tier, Stripe winery billing, referral link tracking | 2–3 weekends |

**Total to revenue-ready:** roughly 17–24 weekends — consistent with the Roadmap's month 9–12 monetization gate at nights-and-weekends pace.

### 5.1 Working method with Claude Code

- Keep this document + a per-module spec in the repo (specs/ folder); start each session by pointing Claude Code at the spec.
- One module per branch; small commits; Claude writes tests alongside features (aim: every edge function has a test).
- Never let the AI invent schema changes mid-feature — schema changes are their own reviewed migration PRs.
- Fortnightly release train via EAS Update (OTA for JS changes, store builds monthly).

## 6. Cross-Cutting Concerns

### 6.1 Security & privacy

- Row-level security on every table from day one; wineries see only aggregated follower data, never raw user identities without consent.
- Age gate (18+) at signup; store DOB, not just a checkbox. App Store 17+ rating; Play content rating equivalent.
- GDPR/POPIA: consent screens for palate-data use, one-tap export and delete (Supabase makes both straightforward). Anonymize before any aggregate leaves the database.

### 6.2 Scalability

Postgres + Supabase comfortably serves 100k+ MAU on paid tiers; nothing here needs microservices. The genuine scale risk is AI spend, handled in §4.4. Design for one region's data volume; sharding is a champagne problem.

### 6.3 Maintainability (your “easy to fix” requirement)

- TypeScript everywhere, one repo (app + dashboard + functions), feature flags via PostHog so broken features can be switched off without a release.
- Sentry for crash reporting; a weekly 30-minute “boring maintenance” slot beats emergency firefighting.

### 6.4 Monthly cost model

| **Stage** | **MAU** | **Infra** | **AI** | **Total** |
| --- | --- | --- | --- | --- |
| Build/beta | < 200 | £0 (free tiers) | £5–15 | ≈ £15 |
| Launch year | 1,000 | £20 (Supabase Pro) | £25–60 | ≈ £50–80 |
| Growth | 10,000 | £60 | £150–300 (offset by Premium) | ≈ £250–350 |

## 7. What NOT to Build (and when to revisit)

| **Don't build** | **Instead** | **Revisit when** |
| --- | --- | --- |
| In-app wine checkout & payments | Link out to winery shops with tracked referrals | Phase 4, with legal review and proven referral volume |
| Custom label-recognition CV model | Claude vision + fuzzy matching | Scanning cost or accuracy becomes the top user complaint |
| Global wine price database | LWIN identity + winery-provided prices | Data API revenue stream justifies Wine-Searcher licensing |
| Social feed / community | Follows + winery announcements only | Retention is strong and users ask for it (Delectable lesson) |
| Native iOS + Android apps | Expo/React Native | Only if a platform-specific feature blocks growth |
| Own auth, own servers, Kubernetes | Supabase + Vercel | Practically never at this scale |

## 8. First 30 Days (concrete start)

- Set up: GitHub repo, Expo app, Supabase project, Apple/Google developer accounts (approval takes days — start now).
- Download LWIN dataset; load into Postgres; check coverage of your region's wineries; list gaps. Use Claude to crawl the Kent wineries' own websites to fill wine lists, stories and style data (with attribution) — this seeds both the app database and the public Kent Wine Index site.
- Ship the Kent Wine Index website (1–2 weekends, Next.js + the seeded database): winery list, wine pages, waitlist form, validation survey.
- Prototype the label-scan pipeline as a script: 30 real label photos → Claude vision → match rate report.
- Build M0 + M1 (skeleton, auth, age gate, taste quiz).
- In parallel, run Phase 0 interviews from the Roadmap — the spec for M2/M3 should absorb what you hear.
