# VineMind — Roadmap

*From idea to revenue in five gated phases (24 months, bootstrap)*

Prepared for Garron Botha  |  July 2026  |  Draft v1.0

## Overview

Five phases over 24 months. Each phase has an exit gate — hard criteria that must be met before moving on, and kill/pivot criteria that force honesty. Nothing in a later phase starts before the current gate is passed. Time assumes nights-and-weekends solo work with AI-assisted development; halve the durations if working full-time.

| **Phase** | **Months** | **Theme** | **Exit gate** |
| --- | --- | --- | --- |
| 0 — Validate | 0–2 | Interviews, not code | 10+ consumer and 5+ winery interviews confirm the problem; 3 wineries verbally commit to pilot |
| 1 — MVP | 2–6 | Consumer app: journal + Brain | App live in both stores; 100 users; 30-day retention ≥ 20% |
| 2 — Winery pilot | 6–9 | QR loop + basic dashboard | 5 founding wineries live; QR scan→signup ≥ 20% |
| 3 — Monetize | 9–15 | Winery SaaS + premium tier | £1,000 MRR; 5 paying wineries |
| 4 — Scale | 15–24 | Second region/market, data products | £3,000+ MRR or funded growth decision |

## Phase 0 — Validate (Months 0–2)

**Goal:** prove people want this before writing app code. Your own notes already contain the right questions — this phase answers them.

### Actions

- Interview 10–15 target consumers (25–40, curious about wine, not experts). Script: How do you choose wine now? Tell me about the last time choosing felt bad. What did you drink at your last tasting visit — can you remember it?
- Visit and interview 5–8 small wineries. Script: How do you keep in touch with tasting-room visitors? What do you know about your customers? What digital tools have you tried and abandoned? What would you pay £59/mo for?
- Build a clickable prototype (Figma) of onboarding quiz → journal → Brain chat. Show it in every interview from week 3.
- Launch the Kent Wine Index: a simple public website listing Kent wineries and wines, with an email waitlist and a short survey (what confuses you about wine? what are you missing? what disappoints you?). This is the landing page, validation instrument, SEO asset and winery door-opener in one.
- Start “Our Wine Story”: taste one wine per week as a couple and post it (TikTok/Instagram). Begins the audience before the app exists and doubles as palate research.
- Desk research: confirm LWIN dataset coverage of English (or SA) wines; test Claude vision on 30 real label photos.

### Deliverables

- Interview notes + one-page synthesis: chosen ICP, top 3 pains, feature cut-list.
- 3 wineries verbally committed as founding partners.
- Named app (trademark + domain + handle check) and one-line positioning.

### Kill / pivot criteria

- Consumers can’t recall a painful wine-choosing moment, or wineries show no interest in follower data → pivot the wedge (e.g. pure tasting-room memory tool) or stop before spending on build.

## Phase 1 — Consumer MVP (Months 2–6)

**Goal:** a genuinely useful solo experience — no winery dependency — shipped to both app stores. Scope is the Technical Build Plan’s Modules 1–4 only.

### In scope

- Signup/login with age gate; taste onboarding quiz → starter palate profile.
- Wine journal: label photo capture, AI label reading, 1-tap rating, notes; searchable history.
- Wine Brain v1: chat grounded in the user’s own journal + a curated knowledge base of ~200 beginner articles and the regional wine list.
- Basic recommendations: rules + embeddings (“liked X → try Y style”), refreshed weekly.

### Out of scope (resist!)

- Winery dashboards, payments, social features, events, price data, cellar management, Android tablet layouts.

### Cadence & checkpoints

- Ship a TestFlight/internal build every 2 weeks to 10–20 waitlist users; one user call per week.
- Month 4 checkpoint: if label scanning accuracy < 80% on real bottles, fall back to search-first entry and fix scanning later.

### Exit gate

- Live in App Store + Play Store; 100 registered users; 30-day retention ≥ 20%; ≥ 50 Brain conversations/week across the base.

## Phase 2 — Winery Pilot (Months 6–9)

**Goal:** close the loop with the 3–5 founding wineries before the summer tourism season peaks.

### Actions

- Winery profiles (built with them, in person), style tags, story, current releases.
- QR stands on tasting counters: scan → follow winery → log the flight you tasted.
- Dashboard v1 (web): follower count, geography, palate mix, most-logged wines. Weekly email digest of the same.
- Push/nudge engine: post-visit follow-ups, new-release announcements from followed wineries.
- Measure everything: scans, signups, follows, repeat opens after visits.

### Exit gate

- 5 wineries live; ≥ 20% of QR scans convert to signups; wineries actively checking the dashboard (weekly logins) — proof they’ll pay in Phase 3.

### Kill / pivot criteria

- If tasting-room visitors won’t scan (< 5% pickup), the acquisition thesis is wrong → test alternative loops (wine shops, tasting events, tour operators) before scaling winery count.

## Phase 3 — Monetize (Months 9–15)

### Actions

- Launch winery tiers: Starter £39/mo (profile, CRM, announcements) and Pro £99/mo (insights, club drops, event tools). Founding wineries stay free-for-life on Starter; upsell Pro.
- Launch consumer Premium £3.49/mo — unlimited Brain chat, deep palate analytics, cellar tracking. Free tier keeps journal + capped chat.
- Referral links to winery web shops with tracked attribution; negotiate 5–10% commission, paid quarterly.
- Recruit wineries 6–20 using pilot case studies (“Winery X gained 240 followers and £1,800 in referred sales in one season”).
- Start the second consumer acquisition channel: short-form content + one partnership (tour operator or regional wine body).

### Exit gate

- £1,000 MRR combined; 5+ paying wineries; premium conversion ≥ 3%; referral tracking demonstrably works end-to-end.

### Kill / pivot criteria

- If wineries won’t convert free→paid at ≥ 25%, the SaaS price/value is wrong: either move value into paid tiers, raise referral share instead, or pivot revenue weight to consumer premium.

## Phase 4 — Scale (Months 15–24)

### Options (choose based on Phase 3 data)

- **Geographic replication:** clone the Kent playbook into Sussex, then South Africa (Stellenbosch/Franschhoek) — the founder’s network and cost base make SA a natural second market. Requires POPIA compliance and ZAR pricing.
- **Data products:** anonymized regional palate-trend reports for distributors, tourism boards and larger producers (£250+/mo or bespoke) — activates your “correlations no one has thought of” idea once data volume supports it.
- **Commerce deepening:** in-app checkout with winery-of-record fulfilment — only now worth the licensing/legal work, and only if referral volume proves demand.
- **Funding:** with £3k+ MRR, two-sided retention and a repeatable regional playbook, a £150–300k angel/pre-seed round becomes credible — or stay bootstrapped and profitable.

### Standing decisions to revisit

- Hire first contractor (design or support) once MRR > £2k.
- Integrations with other wine apps/retailers (your notes) — evaluate only after own loop is solid.

## Operating Rhythm (all phases)

- Weekly: one user or winery conversation, minimum. Metrics review (15 min): MAU, retention, scans, MRR, AI cost per MAU.
- Fortnightly: ship something visible to users. Post one build-in-public update (waitlist email + social).
- Monthly: compare against current phase exit gate; write a one-paragraph honest status note (future investor material).
- Quarterly: kill-criteria review — the explicit permission to stop or pivot is what keeps a bootstrapped project healthy.

## Appendix — Key Market Figures Used

- English wine: ≈ £478m industry revenue (2026), ~6.5% five-year CAGR; 1,104 vineyards / 238 wineries (2024); Kent ≈ 26% of UK plantings; DTC ≈ 30% of sales (down from 57% peak). Sources: ICAEW industry profile; WineGB data via Decanter; The Drinks Business (Dec 2025).
- South Africa: ≈ 85,500 ha under vine; 2026 harvest ≈ 1.37m tons; exports ≈ R9.8bn with premium R200+ segment +34%. Sources: SAWIS; Vinpro harvest reports (May 2026).
- Competitors: Vivino ~60M users, ~$286m revenue, 15% marketplace commission, $224m raised; CellarTracker 1M+ users, subscriptions from $40/yr; Delectable sold after monetization failure. Sources: Tracxn/Growjo estimates; company sites; Jancis Robinson.
- Engagement precedent: Duolingo ~34M DAU driven by streaks/XP/leaderboards; Strava badge/segment model for Gen Z. Sources: Trophy.so and StriveCloud case studies (2025–26).

*Figures are best-available estimates from public sources as of July 2026; re-verify any figure before using it in investor materials.*
