import { createHmac, timingSafeEqual } from "node:crypto";

/** Read-only HS256 JWT adapter. Session issuance belongs to the auth owner. */
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
