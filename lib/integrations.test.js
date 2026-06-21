import { describe, it, expect, vi, beforeEach } from 'vitest';

// Each integration caches by a fixed key in module scope, so tests need a
// fresh module instance (fresh cache) to avoid bleeding into one another.
async function freshModule() {
  vi.resetModules();
  return import('./integrations');
}

describe('getInstagramFeed / getInstagramStories', () => {
  beforeEach(() => {
    vi.unstubAllEnvs();
    global.fetch = vi.fn();
  });

  it('reports not configured when no access token is set, without calling the network', async () => {
    const { getInstagramFeed } = await freshModule();
    const result = await getInstagramFeed();
    expect(result).toEqual({ configured: false, posts: [] });
    expect(global.fetch).not.toHaveBeenCalled();
  });

  it('fetches and normalises live posts when a token is configured', async () => {
    vi.stubEnv('INSTAGRAM_ACCESS_TOKEN', 'token123');
    global.fetch.mockResolvedValue({
      ok: true,
      json: async () => ({
        data: [{ id: '1', media_type: 'IMAGE', media_url: 'https://x/1.jpg', timestamp: 't', extra: 'dropped' }],
      }),
    });
    const { getInstagramFeed } = await freshModule();
    const result = await getInstagramFeed(5);
    expect(result.configured).toBe(true);
    expect(result.posts).toEqual([
      { id: '1', caption: '', media_type: 'IMAGE', media_url: 'https://x/1.jpg', thumbnail_url: undefined, permalink: undefined, timestamp: 't' },
    ]);
  });

  it('caches successive calls instead of refetching within the TTL', async () => {
    vi.stubEnv('INSTAGRAM_ACCESS_TOKEN', 'token123');
    global.fetch.mockResolvedValue({ ok: true, json: async () => ({ data: [] }) });
    const { getInstagramFeed } = await freshModule();
    await getInstagramFeed(12);
    await getInstagramFeed(12);
    expect(global.fetch).toHaveBeenCalledTimes(1);
  });

  it('degrades to configured-but-empty when the Instagram API errors, rather than throwing', async () => {
    vi.stubEnv('INSTAGRAM_ACCESS_TOKEN', 'token123');
    global.fetch.mockResolvedValue({ ok: false, status: 500, json: async () => ({}) });
    const { getInstagramFeed } = await freshModule();
    const result = await getInstagramFeed();
    expect(result.configured).toBe(true);
    expect(result.posts).toEqual([]);
    expect(result.error).toBeTruthy();
  });

  it('stories report not configured without a token', async () => {
    const { getInstagramStories } = await freshModule();
    expect(await getInstagramStories()).toEqual({ configured: false, stories: [] });
  });
});

describe('getGoogleReviews', () => {
  beforeEach(() => {
    vi.unstubAllEnvs();
    global.fetch = vi.fn();
  });

  it('reports not configured when the Places API key or place ID is missing', async () => {
    const { getGoogleReviews } = await freshModule();
    expect(await getGoogleReviews()).toEqual({ configured: false, reviews: [] });
    expect(global.fetch).not.toHaveBeenCalled();
  });

  it('maps live review fields when both env vars are present', async () => {
    vi.stubEnv('GOOGLE_PLACES_API_KEY', 'key123');
    vi.stubEnv('GOOGLE_PLACE_ID', 'place123');
    global.fetch.mockResolvedValue({
      ok: true,
      json: async () => ({
        rating: 4.9,
        userRatingCount: 42,
        googleMapsUri: 'https://maps/x',
        reviews: [
          {
            authorAttribution: { displayName: 'Priya' },
            rating: 5,
            relativePublishTimeDescription: 'a week ago',
            text: { text: 'Loved it!' },
          },
        ],
      }),
    });
    const { getGoogleReviews } = await freshModule();
    const result = await getGoogleReviews();
    expect(result.configured).toBe(true);
    expect(result.rating).toBe(4.9);
    expect(result.reviews[0]).toMatchObject({ author: 'Priya', rating: 5, text: 'Loved it!' });
  });
});
