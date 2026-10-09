import assert from "node:assert/strict";
import { test } from "node:test";
import { readSessionSubject, signSessionToken, SESSION_MAX_AGE_SECONDS } from "../src/lib/session-token.ts";
import { defaultLandingPath, safeNextPath } from "../src/lib/auth/redirect.ts";
import { createLoginLimiter } from "../src/lib/auth/rate-limit.ts";
import { loginSchema, registerSchema, updateUserRoleSchema } from "../src/schemas/auth.ts";

const secret = "test-only-secret-never-use-in-production-32";
const now = 1800000000000;

test("signed session tokens round-trip through the verifier", () => {
  const token = signSessionToken("user-1", secret, now);
  assert.equal(readSessionSubject(token, secret, now + 1000), "user-1");
  assert.equal(readSessionSubject(token, `${secret}x`, now + 1000), null);
  assert.equal(readSessionSubject(token, secret, now + SESSION_MAX_AGE_SECONDS * 1000), null, "expires");
  const [header, payload, signature] = token.split(".");
  const forged = Buffer.from(JSON.stringify({ sub: "admin", exp: now / 1000 + 60 })).toString("base64url");
  assert.equal(readSessionSubject(`${header}.${forged}.${signature}`, secret, now), null, "tampered payload");
});

test("token carries only the user id, never a role", () => {
  const claims = JSON.parse(Buffer.from(signSessionToken("user-1", secret, now).split(".")[1], "base64url").toString());
  assert.deepEqual(Object.keys(claims).sort(), ["exp", "iat", "sub"]);
});

test("signing refuses weak secrets and bad ids", () => {
  assert.throws(() => signSessionToken("user-1", "short", now));
  assert.throws(() => signSessionToken("", secret, now));
  assert.throws(() => signSessionToken("x".repeat(101), secret, now));
});

test("safeNextPath blocks open redirects and auth loops", () => {
  assert.equal(safeNextPath("/rooms?date=2030-01-01"), "/rooms?date=2030-01-01");
  assert.equal(safeNextPath("/admin/bookings"), "/admin/bookings");
  for (const bad of ["//evil.com", "https://evil.com", "/\\evil.com", "javascript:alert(1)", "rooms", "", "/login", "/register?x=1", "/a\nb", undefined, 5, "/".padEnd(501, "a")]) {
    assert.equal(safeNextPath(bad), null, String(bad));
  }
});

test("users land on the page for their role", () => {
  assert.equal(defaultLandingPath("ADMIN"), "/admin/bookings");
  assert.equal(defaultLandingPath("USER"), "/rooms");
});

test("register schema normalizes input and ignores role/id fields", () => {
  const parsed = registerSchema.parse({ role: "ADMIN", id: "x", name: "  Saran K  ", email: " SARAN@Example.COM ", department: " DII ", password: "abcd1234", confirmPassword: "abcd1234" });
  assert.deepEqual(parsed, { name: "Saran K", email: "saran@example.com", department: "DII", password: "abcd1234", confirmPassword: "abcd1234" });
  assert.equal("role" in parsed, false);
});

test("register schema enforces the password policy", () => {
  const valid = { name: "Saran", email: "s@example.com", department: "", password: "abcd1234", confirmPassword: "abcd1234" };
  assert.equal(registerSchema.safeParse(valid).success, true);
  for (const change of [{ password: "short1", confirmPassword: "short1" }, { password: "onlyletters", confirmPassword: "onlyletters" }, { password: "12345678", confirmPassword: "12345678" }, { password: "a1".repeat(37), confirmPassword: "a1".repeat(37) }, { confirmPassword: "different1" }, { email: "nope" }, { name: "x" }]) {
    assert.equal(registerSchema.safeParse({ ...valid, ...change }).success, false, JSON.stringify(change));
  }
});

test("login schema normalizes email and does not apply the registration policy", () => {
  assert.deepEqual(loginSchema.parse({ email: " A@B.CO ", password: "old" }), { email: "a@b.co", password: "old" });
  assert.equal(loginSchema.safeParse({ email: "a@b.co", password: "" }).success, false);
});

test("updateUserRole schema accepts only USER or ADMIN", () => {
  assert.equal(updateUserRoleSchema.safeParse({ userId: "u1", role: "ADMIN" }).success, true);
  assert.equal(updateUserRoleSchema.safeParse({ userId: "u1", role: "ROOT" }).success, false);
  assert.equal(updateUserRoleSchema.safeParse({ userId: "", role: "USER" }).success, false);
});

test("login limiter blocks after repeated failures and recovers", () => {
  const limiter = createLoginLimiter({ maxFailures: 3, windowMs: 1000, blockMs: 5000 });
  for (let index = 0; index < 2; index++) limiter.fail("a@b.co", 0);
  assert.equal(limiter.check("a@b.co", 1).allowed, true);
  limiter.fail("a@b.co", 2);
  assert.deepEqual(limiter.check("a@b.co", 3), { allowed: false, retryAfterSeconds: 5 });
  assert.equal(limiter.check("other@b.co", 3).allowed, true, "per-key");
  assert.equal(limiter.check("a@b.co", 5003).allowed, true, "block expires");
  limiter.fail("a@b.co", 6000); limiter.reset("a@b.co");
  assert.equal(limiter.check("a@b.co", 6001).allowed, true, "reset on success");
});
