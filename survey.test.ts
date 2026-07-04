import { describe, it, expect } from 'vitest';
import { submitSurvey } from '@/lib/actions/survey';
import { makeMockClient } from '../mockSupabase';

describe('submitSurvey', () => {
  it('submitting with no email works', async () => {
    const { client, insertCalls } = makeMockClient({
      survey_responses: { error: null },
    });
    const result = await submitSurvey(
      { qConfuses: 'Jargon', qMissing: 'Prices', qDisappoints: 'Nothing memorable' },
      client
    );
    expect(result.ok).toBe(true);
    expect(insertCalls).toHaveLength(1);
    expect(insertCalls[0].table).toBe('survey_responses');
  });

  it('submitting with email requires the consent box', async () => {
    const { client, insertCalls } = makeMockClient({
      survey_responses: { error: null },
      waitlist_signups: { error: null },
    });
    const result = await submitSurvey(
      {
        qConfuses: 'Jargon',
        qMissing: 'Prices',
        qDisappoints: '',
        email: 'curious@example.com',
        consent: false,
        ageAffirmed: true,
      },
      client
    );
    expect(result.ok).toBe(false);
    expect(result.errors?.consent).toBeDefined();
    expect(insertCalls).toHaveLength(0); // rejected before touching the DB
  });

  it('submitting with email requires the 18+ box (intent.md: anything leading to the waitlist)', async () => {
    const { client, insertCalls } = makeMockClient({
      survey_responses: { error: null },
      waitlist_signups: { error: null },
    });
    const result = await submitSurvey(
      {
        qConfuses: '',
        qMissing: '',
        qDisappoints: '',
        email: 'curious@example.com',
        consent: true,
        ageAffirmed: false,
      },
      client
    );
    expect(result.ok).toBe(false);
    expect(result.errors?.ageAffirmed).toBeDefined();
    expect(insertCalls).toHaveLength(0);
  });

  it('with a valid email it writes both survey_responses and waitlist_signups', async () => {
    const { client, insertCalls } = makeMockClient({
      survey_responses: { error: null },
      waitlist_signups: { error: null },
    });
    const result = await submitSurvey(
      {
        qConfuses: 'Jargon',
        qMissing: 'Prices',
        qDisappoints: 'Nothing memorable',
        email: 'Curious@Example.com',
        consent: true,
        ageAffirmed: true,
      },
      client
    );
    expect(result.ok).toBe(true);
    expect(insertCalls.map((c) => c.table)).toEqual(['survey_responses', 'waitlist_signups']);
    const waitlistPayload = insertCalls[1].payload as any;
    expect(waitlistPayload.email).toBe('curious@example.com'); // normalized lowercase
    expect(waitlistPayload.source).toBe('survey');
  });

  it('a duplicate email on the waitlist insert still counts the survey as submitted', async () => {
    const { client } = makeMockClient({
      survey_responses: { error: null },
      waitlist_signups: { error: { code: '23505', message: 'duplicate key value' } },
    });
    const result = await submitSurvey(
      {
        qConfuses: '',
        qMissing: '',
        qDisappoints: '',
        email: 'again@example.com',
        consent: true,
        ageAffirmed: true,
      },
      client
    );
    expect(result.ok).toBe(true);
  });
});
