import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

/**
 * Server-side Supabase client for Server Components, Route Handlers and Server
 * Actions. Uses the PUBLIC anon key and forwards the user's auth cookies, so
 * every query runs under that user's Row-Level Security context.
 *
 * This is NOT the admin client. For trusted server-only jobs that must bypass
 * RLS (e.g. the knowledge-base ingestion / winery-crawl seeding described in
 * the Technical Build Plan §4.2), create a separate module that reads
 * SUPABASE_SERVICE_ROLE_KEY and is never imported into client code.
 */
export function createClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !anonKey) {
    throw new Error(
      "Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY. " +
        "Copy .env.example to .env.local and fill these in.",
    );
  }

  const cookieStore = cookies();

  return createServerClient(url, anonKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options),
          );
        } catch {
          // called from a Server Component without a mutable cookie store —
          // safe to ignore when middleware refreshes sessions.
        }
      },
    },
  });
}
