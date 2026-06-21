import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { isRateLimited } from './rateLimit';

function fakeRequest(ip) {
  return {
    headers: { get: (name) => (name === 'x-forwarded-for' ? ip : null) },
  };
}

describe('isRateLimited', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('allows requests up to the limit, then blocks', () => {
    const req = fakeRequest('1.2.3.4');
    const opts = { scope: `test-${Math.random()}`, limit: 3, windowMs: 60_000 };

    expect(isRateLimited(req, opts)).toBe(false); // 1st
    expect(isRateLimited(req, opts)).toBe(false); // 2nd
    expect(isRateLimited(req, opts)).toBe(false); // 3rd
    expect(isRateLimited(req, opts)).toBe(true); // 4th — over the limit
  });

  it('tracks each IP independently', () => {
    const opts = { scope: `test-${Math.random()}`, limit: 1, windowMs: 60_000 };
    const reqA = fakeRequest('1.1.1.1');
    const reqB = fakeRequest('2.2.2.2');

    expect(isRateLimited(reqA, opts)).toBe(false);
    expect(isRateLimited(reqA, opts)).toBe(true);
    // a different IP isn't penalised by A's usage
    expect(isRateLimited(reqB, opts)).toBe(false);
  });

  it('resets once the window elapses', () => {
    const req = fakeRequest('3.3.3.3');
    const opts = { scope: `test-${Math.random()}`, limit: 1, windowMs: 60_000 };

    expect(isRateLimited(req, opts)).toBe(false);
    expect(isRateLimited(req, opts)).toBe(true);

    vi.advanceTimersByTime(60_001);

    expect(isRateLimited(req, opts)).toBe(false);
  });

  it('keeps different scopes (book vs cancel) from sharing one bucket', () => {
    const req = fakeRequest('4.4.4.4');
    const suffix = Math.random();

    expect(isRateLimited(req, { scope: `book-${suffix}`, limit: 1, windowMs: 60_000 })).toBe(false);
    expect(isRateLimited(req, { scope: `book-${suffix}`, limit: 1, windowMs: 60_000 })).toBe(true);
    // a different scope for the same IP starts its own count
    expect(isRateLimited(req, { scope: `cancel-${suffix}`, limit: 1, windowMs: 60_000 })).toBe(false);
  });
});
