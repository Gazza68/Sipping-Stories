import { describe, it, expect } from 'vitest';
import { joinWaitlist } from '@/lib/actions/waitlist';
import { makeMockClient } from '../mockSupabase';

const validInput = {
  email: 'drinker@example.com',
  ageAffirmed: true,
  consent: true,
  source: 'home',
};

describe('joinWaitlist', () => {
  it('inserts and returns ok on valid input', async () => {
    const { client, insertCalls } = makeMockClient({
      waitlist_signups: { error: null },
    });
    const result = await joinWaitlist(validInput, client);
    expect(result.ok).toBe(true);
    expect(insertCalls).toHaveLength(1);
    expect(insertCalls[0].table).toBe('waitlist_signups');
    expect(insertCalls[0].payload).toMatchObject({
      email: 'drinker@example.com',
      age_affirmed: true,
      consent: true,
      source: 'home',
    });
  });

  it('rejects when the email is missing/invalid — cannot submit without email', async () => {
    const { client, insertCalls } = makeMockClient({ waitlist_signups: { error: null } });
    const result = await joinWaitlist({ ...validInput, email: 'not-an-email' }, client);
    expect(result.ok).toBe(false);
    expect(result.errors?.email).toBeDefined();
    expect(insertCalls).toHaveLength(0); // never hits the DB
  });

  it('rejects when the 18+ box is unchecked — cannot submit without both checkboxes', async () => {
    const { client, insertCalls } = makeMockClient({ waitlist_signups: { error: null } });
    const result = await joinWaitlist({ ...validInput, ageAffirmed: false }, client);
    expect(result.ok).toBe(false);
    expect(result.errors?.ageAffirmed).toBeDefined();
    expect(insertCalls).toHaveLength(0);
  });

  it('rejects when consent is unchecked', async () => {
    const { client, insertCalls } = makeMockClient({ waitlist_signups: { error: null } });
    const result = await joinWaitlist({ ...validInput, consent: false }, client);
    expect(result.ok).toBe(false);
    expect(result.errors?.consent).toBeDefined();
    expect(insertCalls).toHaveLength(0);
  });

  it('treats a duplicate email as success, not an error', async () => {
    const { client } = makeMockClient({
      waitlist_signups: { error: { code: '23505', message: 'duplicate key value' } },
    });
    const result = await joinWaitlist(validInput, client);
    expect(result.ok).toBe(true);
    expect(result.message).toMatch(/already on the list/i);
  });

  it('surfaces a real DB error as a failure (not silently swallowed)', async () => {
    const { client } = makeMockClient({
      waitlist_signups: { error: { code: '42501', message: 'permission denied' } },
    });
    const result = await joinWaitlist(validInput, client);
    expect(result.ok).toBe(false);
  });
});
