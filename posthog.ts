// lib/posthog.ts
// Client-side only. Keeping the event names + payload shapes centralized
// here means spec §8's list ("treat as required, not optional") is checked
// by TypeScript, not by memory.
'use client';

import posthog from 'posthog-js';

let initialized = false;

export function initPostHog() {
  if (initialized || typeof window === 'undefined') return;
  const key = process.env.NEXT_PUBLIC_POSTHOG_KEY;
  if (!key) return; // no key configured (e.g. local dev without PostHog) — no-op, not an error
  posthog.init(key, {
    api_host: process.env.NEXT_PUBLIC_POSTHOG_HOST || 'https://app.posthog.com',
    capture_pageview: false, // captured manually on route change — see PostHogProvider
    persistence: 'localStorage+cookie',
  });
  initialized = true;
}

type PostHogEvent =
  | { name: 'page_view'; props: { path: string } }
  | { name: 'survey_started'; props?: Record<string, never> }
  | { name: 'survey_completed'; props?: Record<string, never> }
  | { name: 'waitlist_joined'; props: { source: string } }
  | { name: 'winery_viewed'; props: { slug: string } }
  | { name: 'shop_link_clicked'; props: { winery: string } }
  | { name: 'claim_clicked'; props: { winery: string } };

export function capture(event: PostHogEvent) {
  if (typeof window === 'undefined' || !initialized) return;
  posthog.capture(event.name, event.props);
}
