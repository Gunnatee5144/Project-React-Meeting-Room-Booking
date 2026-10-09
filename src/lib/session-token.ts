import { createHmac, timingSafeEqual } from "node:crypto";

/** Session lifetime. The cookie Max-Age and the JWT exp claim both use this. */
export const SESSION_MAX_AGE_SECONDS = 60 * 60 * 24 * 7;

/**
 * Issues an HS256 JWT that readSessionSubject() accepts. Only the user id is stored;
 * the role is always read from the database so a demotion takes effect immediately.
 */
export function signSessionToken(userId: string, secret: string, now = Date.now(), maxAgeSeconds = SESSION_MAX_AGE_SECONDS): string {
  if (secret.length < 32) throw new Error("SESSION_SECRET must be at least 32 characters.");
  if (!userId || userId.length > 100) throw new Error("Invalid user id for session.");
  const header = Buffer.from(JSON.stringify({ alg: "HS256", typ: "JWT" })).toString("base64url");
  const iat = Math.floor(now / 1000);
  const payload = Buffer.from(JSON.stringify({ sub: userId, iat, exp: iat + maxAgeSeconds })).toString("base64url");
  const signature = createHmac("sha256", secret).update(`${header}.${payload}`).digest("base64url");
  return `${header}.${payload}.${signature}`;
}

/** Verifies an HS256 JWT and returns its subject (user id), or null when it is invalid or expired. */
export function readSessionSubject(token: string, secret: string, now = Date.now()): string | null {
  if (secret.length < 32 || token.length > 4096) return null;
  const parts = token.split(".");
  if (parts.length !== 3 || parts.some(part => !/^[A-Za-z0-9_-]+$/.test(part))) return null;
  const [header, payload, signature] = parts;
  try {
    const decodedHeader = JSON.parse(Buffer.from(header, "base64url").toString("utf8"));
    if (decodedHeader.alg !== "HS256") return null;
    const expected = createHmac("sha256", secret).update(`${header}.${payload}`).digest();
    const actual = Buffer.from(signature, "base64url");
    if (actual.length !== expected.length || !timingSafeEqual(actual, expected)) return null;
    const claims = JSON.parse(Buffer.from(payload, "base64url").toString("utf8"));
    if (typeof claims.sub !== "string" || !claims.sub || claims.sub.length > 100 || !Number.isSafeInteger(claims.exp) || claims.exp * 1000 <= now) return null;
    if (claims.nbf !== undefined && (!Number.isSafeInteger(claims.nbf) || claims.nbf * 1000 > now)) return null;
    return claims.sub;
  } catch { return null; }
}
