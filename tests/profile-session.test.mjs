import assert from "node:assert/strict";
import { createHmac } from "node:crypto";
import { test } from "node:test";
import { readSessionSubject } from "../src/lib/session-token.ts";
import { profileSchema } from "../src/schemas/profile.ts";

const secret = "test-only-secret-never-use-in-production-32";
const now = 1800000000000;
function jwt(claims, algorithm = "HS256", key = secret) {
  const header = Buffer.from(JSON.stringify({ alg: algorithm, typ: "JWT" })).toString("base64url");
  const body = Buffer.from(JSON.stringify(claims)).toString("base64url");
  return `${header}.${body}.${createHmac("sha256", key).update(`${header}.${body}`).digest("base64url")}`;
}

test("session identity requires a verified, unexpired signature", () => {
  const valid = jwt({ sub: "user-1", exp: now / 1000 + 60 });
  assert.equal(readSessionSubject(valid, secret, now), "user-1");
  assert.equal(readSessionSubject(valid, "short", now), null);
  assert.equal(readSessionSubject(valid, `${secret}-wrong`, now), null);
  assert.equal(readSessionSubject(jwt({ sub: "user-1", exp: now / 1000 }), secret, now), null);
  assert.equal(readSessionSubject(jwt({ sub: "user-1", exp: now / 1000 - 1 }), secret, now), null);
});

test("malformed, unsupported, missing and not-yet-valid claims fail closed", () => {
  for (const token of ["", "broken.token", "a.b.c", jwt({ sub: "user-1" }), jwt({ sub: 1, exp: now / 1000 + 60 }), jwt({ sub: "user-1", exp: "9999999999" }), jwt({ sub: "user-1", exp: now / 1000 + 60, nbf: now / 1000 + 1 }), jwt({ sub: "user-1", exp: now / 1000 + 60 }, "none"), jwt({ sub: "user-1", exp: now / 1000 + 60 }, "HS512")]) assert.equal(readSessionSubject(token, secret, now), null);
});

test("profile normalization strips fields that could change identity or role", () => {
  const parsed = profileSchema.parse({ id: "victim", role: "ADMIN", passwordHash: "bad", name: "  Gun Test  ", email: "  GUN@EXAMPLE.COM ", department: "  Engineering  " });
  assert.deepEqual(parsed, { name: "Gun Test", email: "gun@example.com", department: "Engineering" });
});

test("profile validation rejects invalid email and oversized text", () => {
  const valid = { name: "Gun", email: "gun@example.com", department: "" };
  for (const change of [{ name: " " }, { email: "bad" }, { name: "x".repeat(101) }, { department: "x".repeat(151) }]) assert.equal(profileSchema.safeParse({ ...valid, ...change }).success, false);
});
