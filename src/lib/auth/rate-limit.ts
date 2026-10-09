// Small in-memory login throttle. It slows online password guessing on a single server
// instance; on serverless/multi-instance hosting each instance keeps its own counters, so
// treat it as a speed bump rather than a hard guarantee.

type Entry = { failures: number; firstFailureAt: number; blockedUntil: number };

export type LoginLimiter = {
  check(key: string, now?: number): { allowed: boolean; retryAfterSeconds: number };
  fail(key: string, now?: number): void;
  reset(key: string): void;
};

export function createLoginLimiter({ maxFailures = 5, windowMs = 15 * 60_000, blockMs = 15 * 60_000, maxKeys = 5000 } = {}): LoginLimiter {
  const entries = new Map<string, Entry>();

  function prune(now: number) {
    if (entries.size < maxKeys) return;
    for (const [key, entry] of entries) {
      if (entry.blockedUntil <= now && now - entry.firstFailureAt > windowMs) entries.delete(key);
    }
    // Still full of live entries: drop the oldest so memory stays bounded.
    while (entries.size >= maxKeys) {
      const oldest = entries.keys().next().value;
      if (oldest === undefined) break;
      entries.delete(oldest);
    }
  }

  return {
    check(key, now = Date.now()) {
      const entry = entries.get(key);
      if (!entry || entry.blockedUntil <= now) return { allowed: true, retryAfterSeconds: 0 };
      return { allowed: false, retryAfterSeconds: Math.ceil((entry.blockedUntil - now) / 1000) };
    },
    fail(key, now = Date.now()) {
      prune(now);
      let entry = entries.get(key);
      if (!entry || now - entry.firstFailureAt > windowMs) {
        entry = { failures: 0, firstFailureAt: now, blockedUntil: 0 };
      }
      entry.failures += 1;
      if (entry.failures >= maxFailures) entry.blockedUntil = now + blockMs;
      entries.set(key, entry);
    },
    reset(key) {
      entries.delete(key);
    },
  };
}
