-- ============================================================================
-- 0001_kent_wine_index.sql
-- ----------------------------------------------------------------------------
-- Initial schema for the PUBLIC Kent Wine Index website.
-- Built directly from specs/kent-wine-index.md §5 (Data model) and its RLS
-- clause. intent.md hard constraints apply (RLS everywhere, GDPR-by-design,
-- age-gate 18+, no alcohol sales).
--
-- Field names follow §5 verbatim. Where §5 says "add columns, don't rename
-- existing ones", the only ADDED columns are:
--   * published (boolean) on wineries + wines — required to honour the §5 RLS
--     rule "publicly readable (published rows only)".
--   * updated_at + trigger on wineries + wines — housekeeping for the editable
--     tables (they gain dashboard editing in M5).
-- These are additive; no §5 field is renamed or removed.
--
-- SCOPE: only the four tables the public site touches. Consumer-app tables
-- (tastings, palate_profiles, kb_chunks, follows, referrals, pgvector, …)
-- belong to later modules and their own migrations.
-- ============================================================================

-- Postgres 13+ ships gen_random_uuid() in core; no extension needed here.

-- ----------------------------------------------------------------------------
-- Shared helper: keep updated_at current on row updates.
-- ----------------------------------------------------------------------------
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- ============================================================================
-- wineries  (§5)
-- id, name, slug, story, geo, style_tags[], shop_url, image_url, claimed,
-- created_at.  geo = town/area; lat/lng optional (added as nullable columns).
-- ============================================================================
create table if not exists public.wineries (
  id          uuid primary key default gen_random_uuid(),
  name        text not null,
  slug        text not null unique,
  story       text,
  geo         text,                     -- town / area
  latitude    double precision,         -- optional (part of §5 "geo … lat/lng optional")
  longitude   double precision,         -- optional
  style_tags  text[] not null default '{}',
  shop_url    text,                     -- outbound winery shop link (nofollow, new tab)
  image_url   text,
  claimed     boolean not null default false,
  published   boolean not null default false,   -- ADDED for RLS (published rows only)
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()  -- ADDED
);

create index if not exists wineries_published_idx on public.wineries (published);

drop trigger if exists wineries_set_updated_at on public.wineries;
create trigger wineries_set_updated_at
  before update on public.wineries
  for each row execute function public.set_updated_at();

-- ============================================================================
-- wines  (§5)
-- id, winery_id (fk), lwin_id (nullable), producer, name, vintage, slug,
-- style_tags[], region, abv, price_band (display only), pairing_tags[],
-- occasion_tags[], organic/biodynamic, soil_type, story, created_at.
-- Dedupe by lwin_id then fuzzy match on producer+name+vintage (handled in seed).
-- ============================================================================
create table if not exists public.wines (
  id             uuid primary key default gen_random_uuid(),
  winery_id      uuid references public.wineries (id) on delete cascade,
  lwin_id        text,                  -- nullable; LWIN identity when available
  producer       text,
  name           text not null,
  vintage        integer,
  slug           text not null unique,
  style_tags     text[] not null default '{}',
  region         text,
  abv            numeric(4, 2),
  price_band     text,                  -- display only, never transactional
  pairing_tags   text[] not null default '{}',
  occasion_tags  text[] not null default '{}',
  organic        boolean,
  biodynamic     boolean,
  soil_type      text,
  story          text,
  published      boolean not null default false,   -- ADDED for RLS
  created_at     timestamptz not null default now(),
  updated_at     timestamptz not null default now()  -- ADDED
);

create index if not exists wines_winery_id_idx on public.wines (winery_id);
create index if not exists wines_lwin_id_idx    on public.wines (lwin_id);
create index if not exists wines_published_idx  on public.wines (published);

drop trigger if exists wines_set_updated_at on public.wines;
create trigger wines_set_updated_at
  before update on public.wines
  for each row execute function public.set_updated_at();

-- ============================================================================
-- waitlist_signups  (§5)
-- id, email, age_affirmed, consent, source, region_interest, created_at.
-- Public INSERT only. age_affirmed + consent enforce intent.md's 18+ / GDPR
-- constraints. Unique-on-email so duplicates can be handled as success (§6.3)
-- rather than erroring.
-- ============================================================================
create table if not exists public.waitlist_signups (
  id              uuid primary key default gen_random_uuid(),
  email           text not null,
  age_affirmed    boolean not null default false,
  consent         boolean not null default false,
  source          text,                 -- e.g. 'home', 'winery_page'
  region_interest text,
  created_at      timestamptz not null default now()
);

create unique index if not exists waitlist_signups_email_key
  on public.waitlist_signups (lower(email));

-- ============================================================================
-- survey_responses  (§5)
-- id, q_confuses, q_missing, q_disappoints, email (nullable), created_at.
-- Public INSERT only.
-- ============================================================================
create table if not exists public.survey_responses (
  id            uuid primary key default gen_random_uuid(),
  q_confuses    text,
  q_missing     text,
  q_disappoints text,
  email         text,                   -- nullable; optional early-access opt-in
  created_at    timestamptz not null default now()
);

-- ============================================================================
-- ROW-LEVEL SECURITY  (§5 RLS clause)
-- Enable RLS on every table (default-deny). wineries + wines publicly readable
-- for PUBLISHED rows only. waitlist_signups + survey_responses are insert-only
-- from the public (no public read). No table is publicly updatable/deletable.
-- The service role bypasses RLS and is used for seeding/ingestion.
-- ============================================================================

alter table public.wineries         enable row level security;
alter table public.wines            enable row level security;
alter table public.waitlist_signups enable row level security;
alter table public.survey_responses enable row level security;

drop policy if exists "wineries public read published" on public.wineries;
create policy "wineries public read published"
  on public.wineries
  for select
  to anon, authenticated
  using (published = true);

drop policy if exists "wines public read published" on public.wines;
create policy "wines public read published"
  on public.wines
  for select
  to anon, authenticated
  using (published = true);

drop policy if exists "waitlist public insert" on public.waitlist_signups;
create policy "waitlist public insert"
  on public.waitlist_signups
  for insert
  to anon, authenticated
  with check (true);

drop policy if exists "survey public insert" on public.survey_responses;
create policy "survey public insert"
  on public.survey_responses
  for insert
  to anon, authenticated
  with check (true);

-- No select/update/delete policies on waitlist_signups or survey_responses:
-- with RLS enabled and no matching policy, those are denied for anon /
-- authenticated. Trusted reads use the service role (server-only).
