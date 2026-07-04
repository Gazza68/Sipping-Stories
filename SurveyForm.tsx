'use client';

import { useRef, useState, useTransition } from 'react';
import { submitSurvey } from '@/lib/actions/survey';
import { capture } from '@/lib/posthog';

export default function SurveyForm() {
  const [qConfuses, setQConfuses] = useState('');
  const [qMissing, setQMissing] = useState('');
  const [qDisappoints, setQDisappoints] = useState('');
  const [email, setEmail] = useState('');
  const [consent, setConsent] = useState(false);
  const [ageAffirmed, setAgeAffirmed] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [done, setDone] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const startedRef = useRef(false);

  function markStarted() {
    if (!startedRef.current) {
      startedRef.current = true;
      capture({ name: 'survey_started' });
    }
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErrors({});
    startTransition(async () => {
      const result = await submitSurvey({
        qConfuses,
        qMissing,
        qDisappoints,
        email: email || undefined,
        consent,
        ageAffirmed,
      });
      if (!result.ok) {
        setErrors(result.errors ?? { form: result.message ?? 'Something went wrong.' });
        return;
      }
      setDone(result.message ?? 'Thank you!');
      capture({ name: 'survey_completed' });
    });
  }

  if (done) {
    return (
      <div role="status" className="rounded-md border border-vine bg-paper px-4 py-3 text-ink">
        {done}
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} onFocus={markStarted} className="flex flex-col gap-6" noValidate>
      <div className="flex flex-col gap-1">
        <label htmlFor="q-confuses" className="font-medium text-ink">
          What confuses you about wine?
        </label>
        <textarea
          id="q-confuses"
          value={qConfuses}
          onChange={(e) => setQConfuses(e.target.value)}
          rows={3}
          placeholder="e.g. I never know what a region actually tells me about the taste"
          className="rounded-md border border-stone bg-paper px-3 py-2 text-ink placeholder:text-ink-soft/50"
        />
      </div>

      <div className="flex flex-col gap-1">
        <label htmlFor="q-missing" className="font-medium text-ink">
          What are you missing?
        </label>
        <textarea
          id="q-missing"
          value={qMissing}
          onChange={(e) => setQMissing(e.target.value)}
          rows={3}
          placeholder="e.g. Something that remembers what I liked last time"
          className="rounded-md border border-stone bg-paper px-3 py-2 text-ink placeholder:text-ink-soft/50"
        />
      </div>

      <div className="flex flex-col gap-1">
        <label htmlFor="q-disappoints" className="font-medium text-ink">
          What disappoints you?
        </label>
        <textarea
          id="q-disappoints"
          value={qDisappoints}
          onChange={(e) => setQDisappoints(e.target.value)}
          rows={3}
          placeholder="e.g. Recommendations that assume I already know what I like"
          className="rounded-md border border-stone bg-paper px-3 py-2 text-ink placeholder:text-ink-soft/50"
        />
      </div>

      <div className="rounded-md border border-stone bg-paper p-4">
        <label htmlFor="q-email" className="font-medium text-ink">
          Want early access? Leave your email (optional)
        </label>
        <input
          id="q-email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@example.com"
          className="mt-2 w-full rounded-md border border-stone bg-chalk px-3 py-2 text-ink placeholder:text-ink-soft/60"
          aria-invalid={Boolean(errors.email)}
        />
        {errors.email && <p className="mt-1 text-sm text-wine">{errors.email}</p>}

        {email && (
          <div className="mt-3 flex flex-col gap-2">
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
              I&rsquo;m okay with Sipping Stories emailing me and storing my answers for this
              purpose.
            </label>
            {errors.consent && <p className="text-sm text-wine">{errors.consent}</p>}
          </div>
        )}
      </div>

      {errors.form && <p className="text-sm text-wine">{errors.form}</p>}

      <button
        type="submit"
        disabled={pending}
        className="self-start rounded-md bg-wine px-5 py-2.5 font-medium text-chalk transition-colors hover:bg-wine-dark disabled:opacity-60"
      >
        {pending ? 'Sending\u2026' : 'Send my answers'}
      </button>
    </form>
  );
}
