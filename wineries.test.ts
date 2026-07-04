import { describe, it, expect } from 'vitest';
import { getWineryBySlug, getWineBySlug, listWineries } from '@/lib/data/wineries';
import { makeMockClient } from '../mockSupabase';

const wineryRow = {
  id: 'w1',
  name: 'Chapel Down',
  slug: 'chapel-down',
  story: 'A Kent winery.',
  geo: 'Tenterden',
  style_tags: ['sparkling'],
  shop_url: 'https://www.chapeldown.com',
  image_url: null,
  claimed: false,
  source: 'ai_crawl',
  source_url: 'https://www.chapeldown.com',
  last_crawled_at: '2026-07-03T00:00:00.000Z',
};

const wineRow = {
  id: 'v1',
  winery_id: 'w1',
  producer: 'Chapel Down',
  name: 'Bacchus',
  vintage: null,
  slug: 'chapel-down-bacchus',
  style_tags: ['white'],
  region: 'Kent',
  abv: null,
  price_band: null,
  pairing_tags: [],
  occasion_tags: [],
  organic: false,
  biodynamic: false,
  soil_type: null,
  story: null,
};

describe('getWineryBySlug', () => {
  it('returns the winery and its wines for a known slug', async () => {
    const { client } = makeMockClient({
      wineries: { data: wineryRow, error: null },
      wines: { data: [wineRow], error: null },
    });
    const result = await getWineryBySlug('chapel-down', client);
    expect(result?.winery.name).toBe('Chapel Down');
    expect(result?.wines).toHaveLength(1);
  });

  it('returns null for an unknown slug (page 404s cleanly, does not throw)', async () => {
    const { client } = makeMockClient({
      wineries: { data: null, error: null },
    });
    const result = await getWineryBySlug('not-a-real-winery', client);
    expect(result).toBeNull();
  });
});

describe('getWineBySlug', () => {
  it('returns the wine and its winery for a known slug', async () => {
    const { client } = makeMockClient({
      wines: { data: wineRow, error: null },
      wineries: { data: wineryRow, error: null },
    });
    const result = await getWineBySlug('chapel-down-bacchus', client);
    expect(result?.wine.name).toBe('Bacchus');
    expect(result?.winery?.name).toBe('Chapel Down');
  });

  it('returns null for an unknown slug', async () => {
    const { client } = makeMockClient({ wines: { data: null, error: null } });
    const result = await getWineBySlug('not-a-real-wine', client);
    expect(result).toBeNull();
  });
});

describe('listWineries', () => {
  it('returns all wineries for the directory page', async () => {
    const { client } = makeMockClient({ wineries: { data: [wineryRow], error: null } });
    const result = await listWineries(client);
    expect(result).toHaveLength(1);
    expect(result[0].slug).toBe('chapel-down');
  });
});
