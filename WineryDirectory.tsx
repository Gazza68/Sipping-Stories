'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import StyleTagPill from './StyleTagPill';
import type { Winery } from '@/lib/data/wineries';

export default function WineryDirectory({ wineries }: { wineries: Winery[] }) {
  const [activeTag, setActiveTag] = useState<string | null>(null);

  const allTags = useMemo(() => {
    const set = new Set<string>();
    wineries.forEach((w) => w.style_tags.forEach((t) => set.add(t)));
    return Array.from(set).sort();
  }, [wineries]);

  const filtered = activeTag
    ? wineries.filter((w) => w.style_tags.includes(activeTag))
    : wineries;

  return (
    <div>
      {allTags.length > 0 && (
        <div className="mb-6 flex flex-wrap gap-2">
          <button
            onClick={() => setActiveTag(null)}
            className={`rounded-sm border px-3 py-1 font-mono text-xs uppercase tracking-wide ${
              activeTag === null
                ? 'border-wine bg-wine text-chalk'
                : 'border-stone bg-paper text-ink-soft hover:border-wine hover:text-wine'
            }`}
          >
            All
          </button>
          {allTags.map((tag) => (
            <button
              key={tag}
              onClick={() => setActiveTag(tag)}
              className={`rounded-sm border px-3 py-1 font-mono text-xs uppercase tracking-wide ${
                activeTag === tag
                  ? 'border-wine bg-wine text-chalk'
                  : 'border-stone bg-paper text-ink-soft hover:border-wine hover:text-wine'
              }`}
            >
              {tag}
            </button>
          ))}
        </div>
      )}

      {filtered.length === 0 ? (
        <p className="text-ink-soft">No wineries match that style yet &mdash; try &ldquo;All&rdquo;.</p>
      ) : (
        <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((winery) => (
            <li key={winery.id}>
              <Link
                href={`/wineries/${winery.slug}`}
                className="block h-full rounded-lg border border-stone bg-paper p-5 transition-colors hover:border-wine"
              >
                <h3 className="font-display text-lg font-semibold text-ink">{winery.name}</h3>
                {winery.geo && <p className="mt-0.5 text-sm text-ink-soft">{winery.geo}</p>}
                {winery.style_tags.length > 0 && (
                  <div className="mt-3 flex flex-wrap gap-1.5">
                    {winery.style_tags.map((tag) => (
                      <StyleTagPill key={tag}>{tag}</StyleTagPill>
                    ))}
                  </div>
                )}
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
