# VineMind

Monorepo-in-one-app: the public **Kent Wine Index** website today, with room for
the **winery dashboard** later — both under one Next.js App Router project sharing
one Supabase backend.

> Working name only. See `intent.md` for the master intent (it wins over code).

## Structure

```
app/
  layout.tsx            Root layout (shared <html>/<body> only)
  globals.css           Tailwind entrypoint
  (public)/             Kent Wine Index — public SEO/waitlist/survey site
    layout.tsx          Public shell (nav/footer go here)
    page.tsx            PLACEHOLDER only — replace with real landing page
  # (dashboard)/        <- winery dashboard route group added in M5
lib/
  supabase/
    client.ts           Browser client (anon key, RLS-governed)
    server.ts           Server client (cookies + anon key, RLS-governed)
supabase/
  migrations/
    0001_kent_wine_index.sql   wineries, wines, waitlist_signups,
                               survey_responses + RLS
.env.example            Required env vars (copy to .env.local)
```

## Getting started

```bash
npm install
cp .env.example .env.local   # then fill in the values
npm run dev
```

Apply the migration to your Supabase project (e.g. via the Supabase CLI:
`supabase db push`, or paste the SQL into the SQL editor).

## Schema

`supabase/migrations/0001_kent_wine_index.sql` is built from
`specs/kent-wine-index.md` §5, field-for-field: `wineries`, `wines`,
`waitlist_signups`, `survey_responses` + the §5 RLS rules (public read on
published wineries/wines; insert-only public access to waitlist/survey; nothing
publicly updatable or deletable). The only additions over §5 are a `published`
flag (needed to honour the "published rows only" RLS rule) and `updated_at`
housekeeping on the two editable tables — no §5 field is renamed or dropped.
