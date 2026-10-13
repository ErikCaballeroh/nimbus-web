import { ApiError } from "./api";

/**
 * Per-process, per-IP fixed-window limiter for the unauthenticated auth
 * endpoints (login/register/recover). Good enough for a single-instance
 * deployment; a multi-instance deployment would need a shared store (e.g.
 * Redis) instead. No `server-only` marker: unlike lib/db.ts/lib/permissions.ts
 * this touches no secrets or the database, and (like lib/roles.ts) it's only
 * ever called from route handlers, never imported by a Client Component.
 */
const WINDOW_MS = 15 * 60 * 1000;
const MAX_ATTEMPTS = 5;

interface Bucket {
  count: number;
  resetAt: number;
}

const buckets = new Map<string, Bucket>();

function sweepExpired(now: number): void {
  for (const [key, bucket] of buckets) {
    if (now > bucket.resetAt) buckets.delete(key);
  }
}

function clientIp(request: Request): string {
  const forwardedFor = request.headers.get("x-forwarded-for");
  if (forwardedFor) return forwardedFor.split(",")[0].trim();
  return request.headers.get("x-real-ip") ?? "unknown";
}

/** Throws RATE_LIMITED once `action` has been attempted MAX_ATTEMPTS times from this IP within WINDOW_MS. */
export function assertRateLimit(request: Request, action: string): void {
  const now = Date.now();
  if (Math.random() < 0.01) sweepExpired(now);

  const key = `${action}:${clientIp(request)}`;
  const bucket = buckets.get(key);

  if (!bucket || now > bucket.resetAt) {
    buckets.set(key, { count: 1, resetAt: now + WINDOW_MS });
    return;
  }

  if (bucket.count >= MAX_ATTEMPTS) {
    throw new ApiError("RATE_LIMITED", "Demasiados intentos. Inténtalo de nuevo en unos minutos.");
  }

  bucket.count++;
}
