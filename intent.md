# intent.md — VineMind (working name)

> Master intent file. Lives in the repo root. Every AI-assisted build session starts by reading this file. If code and this file disagree, this file wins — or gets updated deliberately.

## What we are building

A two-sided wine platform:

1. **Consumer mobile app** — gives every drinker a personal AI **Wine Brain**: a companion that learns their palate, remembers every bottle, and guides their wine journey in plain, non-snobby language.
2. **Winery web dashboard** — gives small wineries a direct channel to the consumers they currently cannot see: follower CRM, palate insights, club/release tools, event RSVPs.

The two sides form one loop: consumers feed the Brain → the Brain feeds winery insights → wineries feed exclusive content, releases and events back to consumers.

**Positioning:** "Duolingo for wine, with the wineries inside."

## Why (the problem)

- Consumers — especially under-40s — find wine confusing and intimidating; nothing remembers their journey. Existing apps (Vivino, CellarTracker) are databases for enthusiasts, not companions for beginners.
- Small wineries depend on direct-to-consumer sales (~30% of English wine sales) but are digitally invisible: no data on who their fans are, email-only clubs, zero post-visit engagement.
- Enterprise DTC tools (Commerce7, WineDirect) are priced for large US wineries, not a 5-hectare Kent or Stellenbosch farm.

## Who it's for

- **Primary consumer ICP:** 25–40, curious about wine, not experts, in/around the launch region. Anti-persona: wine snobs.
- **Primary winery ICP:** small independent wineries in one dense region (Kent first; Stellenbosch/Franschhoek is the planned second market).

## Goal

Make money. Phased revenue:

1. **Winery SaaS** — £39/mo Starter, £99/mo Pro (month 9+). Wineries pay first.
2. **Consumer Premium** — £3.49/mo or £29/yr (month 12+).
3. **Referral commission** — 5–10% on sales driven to winery web shops (month 12+).
4. **Insights/data API** — anonymized regional palate trends (year 2+).

Success gates: 100 users + 20% 30-day retention (Phase 1) → 5 wineries live + 20% QR-scan conversion (Phase 2) → £1,000 MRR (Phase 3).

## Hard constraints

- **Bootstrap:** ≤ £5,000 year one. Solo/couple, nights-and-weekends, AI-assisted (Claude Code).
- **No alcohol sales in v1.** Link out to winery shops; never hold stock or take wine payments. No alcohol licence needed. Revisit only in Phase 4 with legal review.
- **Age-gated 18+** (DOB at signup, store 17+/equivalent ratings).
- **GDPR/POPIA by design:** row-level security everywhere; consent for palate-data use; one-tap export/delete; only aggregated anonymized data ever leaves.
- **Responsible by design:** gamify learning and variety, never consumption volume. Include low/no-alcohol filters.
- **Modular:** independent modules (M0–M6) behind clear interfaces; each buildable, fixable, replaceable on its own. Later modules read earlier ones through views, never write into them.

## Stack (decided — don't relitigate casually)

- Mobile: React Native + Expo, TypeScript
- Backend: Supabase (Postgres, Auth, Storage, Edge Functions, RLS)
- Vectors: pgvector (palate profiles + knowledge-base RAG)
- AI: Claude API — Haiku for extraction/classification, Sonnet for Brain chat, vision for label scanning
- Web (winery dashboard + public Kent Wine Index site): Next.js on Vercel
- Wine data: LWIN dataset (free, CC licence) + winery-provided + AI-crawled enrichment
- Analytics: PostHog · Errors: Sentry · Payments: RevenueCat (consumer) + Stripe (winery SaaS)

## Build order

M0 Skeleton → M1 Identity & taste quiz → M2 Wine Journal (scan, rate, notes) → M3 Wine Brain (RAG chat + palate profile) → M4 Recommendations → M5 Winery platform (profiles, QR loop, dashboard) → M6 Monetization.

Plus, before/alongside M0: the **Kent Wine Index** public website (SEO, waitlist, validation survey, winery door-opener).

## Product principles

1. Useful solo from day one — the journal + Brain must work with zero wineries on board.
2. Plain language always; explain every recommendation ("why this").
3. The user's palate data works for *them* — trust is the moat.
4. Ship every two weeks; talk to one user or winery every week.
5. Cheapest thing that works: buy/borrow before build; cache AI aggressively; AI cost per MAU < £0.10/mo.

## Non-goals (v1)

- In-app wine checkout, payments or fulfilment
- Social feed / community features (Delectable lesson)
- Global wine or price database ambitions
- Custom computer-vision models
- Native per-platform apps, microservices, own auth

## Open questions (resolve in Phase 0, then update this file)

- Final name (leading candidate: **Sipping Stories**; trademark/handle checks pending)
- Launch region confirmation: Kent vs Stellenbosch (decision rule: wherever we can physically visit tasting rooms)
- LWIN coverage of regional wines — gap size determines manual seeding effort
- Winery willingness to pay £59–99/mo — validate in interviews before building M5/M6
