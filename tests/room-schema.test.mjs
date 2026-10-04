import assert from "node:assert/strict";
import { test } from "node:test";
import { roomSchema } from "../src/schemas/room.ts";

const room = { name: "Meeting A", location: "Building A", capacity: 8, imageUrl: "", isActive: true, equipmentIds: [] };

test("room capacity requires a positive integer", () => {
  for (const capacity of [0, -1, 1.5, NaN, Infinity, 10001, "8"]) assert.equal(roomSchema.safeParse({ ...room, capacity }).success, false);
  assert.equal(roomSchema.parse({ ...room, capacity: 10000 }).capacity, 10000);
});

test("image URLs allow only HTTPS without embedded credentials", () => {
  for (const imageUrl of ["javascript:alert(1)", "data:image/png;base64,abc", "http://example.com/a.png", "https://user:password@example.com/a.png", "not-a-url"]) assert.equal(roomSchema.safeParse({ ...room, imageUrl }).success, false);
  assert.ok(roomSchema.safeParse({ ...room, imageUrl: "https://example.com/a.png" }).success);
  assert.ok(roomSchema.safeParse(room).success);
});

test("equipment IDs cannot repeat and unknown database fields are stripped", () => {
  assert.equal(roomSchema.safeParse({ ...room, equipmentIds: ["one", "one"] }).success, false);
  const parsed = roomSchema.parse({ ...room, id: "victim", bookings: { deleteMany: {} }, name: " Meeting A " });
  assert.equal(parsed.name, "Meeting A");
  assert.equal("id" in parsed, false);
  assert.equal("bookings" in parsed, false);
});
