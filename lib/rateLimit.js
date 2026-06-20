// Best-effort per-IP throttle for write endpoints. State lives in the memory
// of the running function instance — Fluid Compute reuses instances across
// requests, so this catches casual spam/abuse at zero infra cost. It isn't a
// substitute for a real WAF rule under sustained/distributed attack.

const buckets = new Map();

function prune(now, maxAgeMs) {
  if (buckets.size < 2000) return;
  for (const [key, bucket] of buckets) {
    if (now - bucket.start > maxAgeMs) buckets.delete(key);
  }
}

function clientIp(request) {
  return (
    request.headers.get('x-forwarded-for')?.split(',')[0].trim() ||
    request.headers.get('x-real-ip') ||
    'unknown'
  );
}

// Returns true if this request should be rejected with 429.
export function isRateLimited(request, { scope, limit, windowMs }) {
  const now = Date.now();
  prune(now, windowMs);

  const key = `${scope}:${clientIp(request)}`;
  const bucket = buckets.get(key);

  if (!bucket || now - bucket.start > windowMs) {
    buckets.set(key, { start: now, count: 1 });
    return false;
  }
  bucket.count += 1;
  return bucket.count > limit;
}
