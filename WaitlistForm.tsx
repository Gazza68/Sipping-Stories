'use client';

import { useState, useTransition } from 'react';
import { joinWaitlist } from '@/lib/actions/waitlist';
import { capture } from '@/lib/posthog';

export default function WaitlistForm({ source }: { source: string }) {
  const [email, setEmail] = useState('');
  const [ageAffirmed, setAgeAffirmed] = useState(false);
  const [consent, setConsent] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErrors({});
    startTransition(async () => {
      const result = await joinWaitlist({ email, ageAffirmed, consent, source });
      if (!result.ok) {
        setErrors(result.errors ?? { form: result.message ?? 'Something went wrong.' });
        return;
      }
      setSuccessMessage(result.message ?? 'You\u2019re on the list!');
      capture({ name: 'waitlist_joined', props: { source } });
    });
  }

  if (successMessage) {
    return (
      <div role="status" className="rounded-md border border-vine bg-paper px-4 py-3 text-sm text-vine">
        {successMessage}
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-3" noValidate>
      <div className="flex flex-col gap-1">
        <label htmlFor={`waitlist-email-${source}`} className="text-sm font-medium text-ink">
          Email
        </label>
        <input
          id={`waitlist-email-${source}`}
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@example.com"
          className="rounded-md border border-stone bg-paper px-3 py-2 text-ink placeholder:text-ink-soft/60"
          aria-invalid={Boolean(errors.email)}
          aria-describedby={errors.email ? `waitlist-email-error-${source}` : undefined}
        />
        {errors.email && (
          <p id={`waitlist-email-error-${source}`} className="text-sm text-wine">
            {errors.email}
          </p>
        )}
      </div>

      <label className="flex items-start gap-2 text-sm text-ink-soft">
        <input
          type="checkbox"
          checked={ageAffirmed}
          onChange={(e) => setAgeAffirmed(e.target.checked)}
          className="mt-0.5"
        />
        I confirm I&rsquo;m 18 or over.
      </label>
      {errors.ageAffirmed && <p className="text-sm text-wine">{errors.ageAffirmed}</p>}

      <label className="flex items-start gap-2 text-sm text-ink-soft">
        <input
          type="checkbox"
          checked={consent}
          onChange={(e) => setConsent(e.target.checked)}
          className="mt-0.5"
        />
        I&rsquo;m okay with Sipping Stories emailing me about early access and storing my survey
        answers for this purpose. (See our{' '}
        <a href="/privacy" className="underline">
          privacy note
        </a>
        .)
      </label>
      {errors.consent && <p className="text-sm text-wine">{errors.consent}</p>}
      {errors.form && <p className="text-sm text-wine">{errors.form}</p>}

      <button
        type="submit"
        disabled={pending}
        className="mt-1 self-start rounded-md bg-wine px-5 py-2 font-medium text-chalk transition-colors hover:bg-wine-dark disabled:opacity-60"
      >
        {pending ? 'Joining\u2026' : 'Join the waitlist'}
      </button>
    </form>
  );
}
