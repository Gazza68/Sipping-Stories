'use server';
// lib/actions/waitlist.ts
import { SupabaseClient } from '@supabase/supabase-js';
import { getSupabaseServerClient } from '../supabase/server';
import { isValidEmail, ActionResult } from '../validation';

export interface WaitlistInput {
  email: string;
  ageAffirmed: boolean;
  consent: boolean;
  source: string;
  regionInterest?: string;
}

const POSTGRES_UNIQUE_VIOLATION = '23505';

// `client` is injected (defaulting to the real one) purely so tests can pass
// a mock — Next.js server actions only serialize the arguments a caller
// actually supplies, so this default is invisible to the client boundary.
export async function joinWaitlist(
  input: WaitlistInput,
  client: SupabaseClient = getSupabaseServerClient()
): Promise<ActionResult> {
  const errors: Record<string, string> = {};
  if (!input.email || !isValidEmail(input.email)) {
    errors.email = 'Enter a valid email address.';
  }
  if (!input.ageAffirmed) {
    errors.ageAffirmed = 'You need to confirm you\u2019re 18 or over.';
  }
  if (!input.consent) {
    errors.consent = 'Consent is required to join the waitlist.';
  }
  if (Object.keys(errors).length > 0) {
    return { ok: false, errors };
  }

  const { error } = await client.from('waitlist_signups').insert({
    email: input.email.trim().toLowerCase(),
    age_affirmed: input.ageAffirmed,
    consent: input.consent,
    source: input.source,
    region_interest: input.regionInterest ?? null,
  });

  if (error) {
    // Spec §6.3: "Duplicate email → treat as success (don't error), don't
    // create duplicate row." The unique constraint on email is what makes
    // this safe to rely on rather than doing a racy check-then-insert.
    if (error.code === POSTGRES_UNIQUE_VIOLATION) {
      return { ok: true, message: 'You\u2019re already on the list \u2014 we\u2019ll be in touch.' };
    }
    return { ok: false, message: 'Something went wrong \u2014 please try again.' };
  }

  return { ok: true, message: 'You\u2019re on the list!' };
}
