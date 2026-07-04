'use server';
// lib/actions/survey.ts
import { SupabaseClient } from '@supabase/supabase-js';
import { getSupabaseServerClient } from '../supabase/server';
import { isValidEmail, ActionResult } from '../validation';

export interface SurveyInput {
  qConfuses: string;
  qMissing: string;
  qDisappoints: string;
  email?: string;
  consent?: boolean;
  // Not in spec §6.2's literal field list, but intent.md §2 requires an
  // 18+ affirmation on anything that leads to the waitlist — and this form
  // does, when an email is given. Only required/shown in that case.
  ageAffirmed?: boolean;
}

const POSTGRES_UNIQUE_VIOLATION = '23505';

export async function submitSurvey(
  input: SurveyInput,
  client: SupabaseClient = getSupabaseServerClient()
): Promise<ActionResult> {
  const email = input.email?.trim();
  const errors: Record<string, string> = {};

  if (email) {
    if (!isValidEmail(email)) errors.email = 'Enter a valid email address, or leave it blank.';
    if (!input.consent) errors.consent = 'Consent is required to leave your email.';
    if (!input.ageAffirmed) errors.ageAffirmed = 'Confirm you\u2019re 18 or over to join the waitlist.';
  }
  if (Object.keys(errors).length > 0) {
    return { ok: false, errors };
  }

  const { error: surveyError } = await client.from('survey_responses').insert({
    q_confuses: input.qConfuses || null,
    q_missing: input.qMissing || null,
    q_disappoints: input.qDisappoints || null,
    email: email || null,
  });
  if (surveyError) {
    return { ok: false, message: 'Something went wrong \u2014 please try again.' };
  }

  if (email) {
    const { error: waitlistError } = await client.from('waitlist_signups').insert({
      email: email.toLowerCase(),
      age_affirmed: input.ageAffirmed,
      consent: input.consent,
      source: 'survey',
    });
    if (waitlistError && waitlistError.code !== POSTGRES_UNIQUE_VIOLATION) {
      return {
        ok: true,
        message:
          'Thanks for the feedback! We couldn\u2019t add you to the waitlist \u2014 try the waitlist form separately.',
      };
    }
  }

  return { ok: true, message: 'Thank you \u2014 this genuinely helps us build the right thing.' };
}
