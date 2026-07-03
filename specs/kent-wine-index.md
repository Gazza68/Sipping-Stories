# Build Spec — Kent Wine Index (public prototype website)

> **How to use this file:** This is the master spec for the Kent Wine Index. Start every Claude Code session by reading `intent.md` (project root) first, then this file. If code and this file disagree, this file wins — or gets updated deliberately. Keep this at `specs/kent-wine-index.md` in the repo.

## 1. Purpose

The Kent Wine Index is the Phase 0 validation website for Sipping Stories (working name). It is **not** the app. Its only jobs are:

1. **Validate** — prove under-40 wine-curious people want a companion, via a survey + waitlist.
2. **Capture** — collect an email waitlist for the future consumer app.
3. **Open doors** — give each Kent winery a live page we can show them to start a pilot conversation.

It doubles as an SEO asset and the seed of the shared `wines`/`wineries` database that later feeds the app (M1–M2). **Do not build throwaway data** — everything seeded here is reused.

Positioning line to use on the site: *"Duolingo for wine, with the wineries inside."* (Plain, non-snobby language everywhere. Anti-persona: wine snobs.)

## 2. Hard constraints (from intent.md — do not violate)

- **No alcohol sales.** The site never holds stock or takes wine payments. Winery pages link *out* to the winery's own shop. No checkout, no cart, no prices we transact on.
- **Age-gate 18+.** Any page that leads toward the app/waitlist must sit behind or alongside an 18+ confirmation (DOB or 18+ affirm at waitlist signup; store the affirmation).
- **GDPR by design.** Explicit consent checkbox on the waitlist/survey for storing email + using survey answers. One-tap export/delete must be possible (Supabase makes this straightforward). Only aggregated, anonymised data ever leaves the DB.
- **Responsible by design.** Copy gamifies learning and variety, never consumption volume.
- **Bootstrap.** Free tiers only (Vercel + Supabase free). Running cost target £0/mo for this prototype.
- **Ship in ≤ 2 weekends.** If a feature threatens that, it's out of scope.

## 3. Stack (decided — do not relitigate)

- **Framework:** Next.js (App Router, TypeScript) on Vercel free tier.
- **Backend/DB:** Supabase (Postgres, Row-Level Security). Same project the app will use.
- **Styling:** Tailwind CSS. Keep it clean and mobile-first; most traffic will be phones.
- **Analytics:** PostHog (free tier) — funnels for visit → survey → waitlist.
- **Forms:** native Next.js server actions / route handlers writing to Supabase. No third-party form service.
- **Wine data:** LWIN dataset (free CC licence) + AI-crawled winery enrichment (with attribution).

This is the same Next.js project that will later hold the winery dashboard, so structure it so the public site and dashboard can coexist (e.g. `app/(public)/…` route group now, `app/(dashboard)/…` later).

## 4. Scope

### In scope (build this)

- Home / landing page with positioning, survey CTA, waitlist form.
- Validation survey (3 questions).
- Waitlist signup with email + 18+ affirmation + consent.
- Kent winery directory (list of all seeded wineries).
- Individual winery pages (story, style tags, wine list, outbound shop link, "claim this page" CTA).
- Individual wine detail pages.
- PostHog instrumentation on the key funnel events.
- Basic SEO (per-page titles/meta, sitemap, Open Graph tags).

### Out of scope (resist — this is not the app)

- User login / accounts / the consumer app itself.
- Winery dashboard, editing, or winery login (the "claim" CTA is just a mailto/form lead for now).
- Any payments, cart, checkout, or price transactions.
- Label scanning, Wine Brain, recommendations, palate quiz.
- Social feed, comments, reviews, ratings by public users.
- Android/tablet-specific layouts (responsive web is enough).

## 5. Data model (subset of the shared schema)

Use the real app tables so seeded data carries forward. Only these are needed for the prototype; add columns, don't rename existing ones.

**`wineries`**
- `id`, `name`, `slug` (unique, for URLs), `story` (text), `geo` (town/area + lat/lng optional), `style_tags[]`, `shop_url` (outbound), `image_url`, `claimed` (bool, default false), `created_at`.

**`wines`**
- `id`, `winery_id` (fk), `lwin_id` (nullable), `producer`, `name`, `vintage`, `slug` (unique), `style_tags[]`, `region`, `abv`, `price_band` (display only, not transactional), `pairing_tags[]`, `occasion_tags[]`, `organic`/`biodynamic` flags, `soil_type`, `story`, `created_at`. Dedupe by `lwin_id` then fuzzy match on producer+name+vintage.

**`waitlist_signups`**
- `id`, `email`, `age_affirmed` (bool), `consent` (bool), `source` (e.g. `home`, `winery_page`), `region_interest`, `created_at`.

**`survey_responses`**
- `id`, `q_confuses` (text), `q_missing` (text), `q_disappoints` (text), `email` (nullable, if they left one), `created_at`.

**RLS:** enable Row-Level Security on every table from day one. `wineries` and `wines` are publicly readable (published rows only). `waitlist_signups` and `survey_responses` are insert-only from the public (no public read). No table is publicly updatable/deletable.

## 6. Pages & requirements

### 6.1 Home `/`
- Hero: positioning line + one-sentence explainer + primary CTA (join waitlist) and secondary CTA (take the 60-second survey).
- Short "why" section (wine is confusing; nothing remembers your journey — plain language).
- Waitlist form (see 6.3) inline.
- Link into the winery directory.
- **Acceptance:** loads < 2s on 3G-simulated mobile; CTA visible above the fold on a phone.

### 6.2 Survey `/survey`
- Exactly three questions (free-text): *What confuses you about wine? What are you missing? What disappoints you?*
- Optional email field ("want early access? leave your email").
- Consent checkbox required if email given.
- On submit → write to `survey_responses` (+ `waitlist_signups` if email given) → thank-you state.
- **Acceptance:** submitting with no email works; submitting with email requires the consent box; a PostHog `survey_completed` event fires.

### 6.3 Waitlist form (component, used on home + winery pages)
- Fields: email (required, validated), 18+ affirmation checkbox (required), consent checkbox (required), hidden `source`.
- On submit → insert into `waitlist_signups` → inline success message.
- Duplicate email → treat as success (don't error), don't create duplicate row.
- **Acceptance:** cannot submit without email + both checkboxes; `waitlist_joined` PostHog event fires with `source`.

### 6.4 Winery directory `/wineries`
- Grid/list of all seeded wineries: name, town, style tags, thumbnail. Links to each winery page.
- Simple filter by style tag (client-side is fine).
- **Acceptance:** every seeded winery appears and links to a working page.

### 6.5 Winery page `/wineries/[slug]`
- Winery story, location, style tags, image.
- List of that winery's wines (linking to wine pages).
- Outbound "Visit their shop" button (`shop_url`, `rel="nofollow noopener"`, opens new tab) — clearly external.
- "Is this your winery? Claim this page" CTA → simple lead capture (email us / form writing a flag), **no winery login**.
- Waitlist form near the bottom (`source=winery_page`).
- Attribution footnote where content was AI-crawled from the winery's own site.
- **Acceptance:** renders from DB by slug; 404s cleanly for unknown slug; outbound link never implies we sell the wine.

### 6.6 Wine page `/wines/[slug]`
- Wine identity: producer, name, vintage, region, style tags, ABV, price_band (display only), story, pairing/occasion tags, organic/soil flags where present.
- Link back to its winery.
- **Acceptance:** renders from DB; no buy button, no price transaction.

### 6.7 Cross-cutting
- Per-page `<title>` and meta description; Open Graph tags; `sitemap.xml` and `robots.txt`.
- 18+ context clear before any waitlist submission.
- Footer: brief privacy note + link to a simple privacy page covering data use, export/delete request route.

## 7. Data seeding (do this first — ½ weekend)

1. Stand up the Supabase project; apply migrations for the tables in §5 with RLS.
2. Download the LWIN dataset; load into Postgres; **report coverage of Kent wineries and list gaps** (this number decides how much manual seeding costs — surface it, don't hide it).
3. For gaps, use Claude to crawl Kent winery websites and extract wine lists, stories, and style tags into `wineries`/`wines`, **with source attribution** stored per row.
4. Generate `slug`s (kebab-case, deduped) for all wineries and wines.
5. Provide a re-runnable seed script (`scripts/seed.ts`) so the data can be rebuilt.
- **Acceptance:** directory page populates from real seeded Kent data; a written coverage-gap note exists.

## 8. Analytics events (PostHog)

Fire at minimum: `page_view` (all), `survey_started`, `survey_completed`, `waitlist_joined` (with `source`), `winery_viewed` (with slug), `shop_link_clicked` (with winery), `claim_clicked`. These are the validation signal — treat them as required, not optional.

## 9. Definition of done

- Deployed live on Vercel with a real domain.
- All pages in §6 working from seeded Supabase data.
- Waitlist + survey writing to DB with consent + 18+ enforced; RLS verified (public cannot read signups/responses).
- PostHog funnel visible: visit → survey → waitlist.
- Sitemap + per-page SEO meta present.
- README section covering: env vars, how to run locally, how to re-seed, how to handle a GDPR export/delete request.
- Built and shipped within ~2 weekends. If scope grew, cut features back to §4, don't extend.

## 10. Working method for Claude Code

- One feature per branch; small commits; commit to Git from day one.
- Schema changes are their own reviewed migration PRs — never invent schema mid-feature.
- Write a test for each server action / route handler (waitlist insert, survey insert, slug lookup).
- Structure the Next.js project so the public site lives in a route group that can coexist with the future winery dashboard.
- Every session: read `intent.md`, then this spec, before writing code.

## 11. Open items to confirm before go-live (from intent.md)

- **Final name** — Sipping Stories vs VineMind. Locks the domain, page copy, and OG tags. Decide before deploy.
- **Launch region** — Kent confirmed vs Stellenbosch. This spec assumes Kent.
- **LWIN coverage of English wines** — output from §7 step 2; determines manual seeding effort.

---
*Prepared for Garron Botha · Sipping Stories · derived from intent.md, Roadmap, and Technical Build Plan.*
