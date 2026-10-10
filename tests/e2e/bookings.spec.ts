import { test, expect, type BrowserContext } from "@playwright/test";
import { createHmac } from "node:crypto";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../../src/generated/prisma/client";
import { TEST_DATABASE_URL, TEST_SESSION_SECRET } from "../../playwright.config";

const database = new PrismaClient({ adapter: new PrismaPg({ connectionString: TEST_DATABASE_URL, max: 1 }) });

const CALENDAR_ROOM = "test-page-1";
const CALENDAR_ROOM_NAME = "ทดสอบแบ่งหน้า 01";
const bangkokToday = new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Bangkok" }).format(new Date());
const todayAt = (time: string) => new Date(`${bangkokToday}T${time}:00+07:00`);

test.beforeAll(async () => {
  await database.booking.createMany({ data: [
    { id: "calendar-mine", roomId: CALENDAR_ROOM, userId: "test-user", topic: "ประชุมของฉัน", startTime: todayAt("10:00"), endTime: todayAt("11:00"), attendeeCount: 1, status: "APPROVED" },
    { id: "calendar-other", roomId: CALENDAR_ROOM, userId: "test-other", topic: "PRIVATE CALENDAR TOPIC", startTime: todayAt("13:00"), endTime: todayAt("14:00"), attendeeCount: 1, status: "PENDING" },
  ] });
});
test.afterAll(async () => {
  await database.booking.deleteMany({ where: { id: { in: ["calendar-mine", "calendar-other"] } } });
  await database.$disconnect();
});

async function signIn(context: BrowserContext, id: string) {
  const header = Buffer.from(JSON.stringify({ alg: "HS256", typ: "JWT" })).toString("base64url");
  const claims = Buffer.from(JSON.stringify({ sub: id, exp: Math.floor(Date.now() / 1000) + 3600 })).toString("base64url");
  const signature = createHmac("sha256", TEST_SESSION_SECRET).update(`${header}.${claims}`).digest("base64url");
  await context.addCookies([{ name: "session", value: `${header}.${claims}.${signature}`, url: "http://127.0.0.1:3100", httpOnly: true, sameSite: "Lax" }]);
}

test("non-admins leave /admin/bookings for home instead of looping through /login", async ({ page, context }) => {
  await signIn(context, "test-user");
  await page.goto("/admin/bookings");
  await expect(page).toHaveURL("http://127.0.0.1:3100/");
  await expect(page.getByRole("heading", { level: 1 })).toContainText("ห้องพร้อม");
});

test("guests are sent to login from /admin/bookings and /calendar", async ({ page }) => {
  await page.goto("/admin/bookings");
  await expect(page).toHaveURL(/\/login\?next=%2Fadmin%2Fbookings/);
  await page.goto("/calendar");
  await expect(page).toHaveURL(/\/login\?next=%2Fcalendar/);
});

test("admins see review buttons on pending requests", async ({ page, context }) => {
  await signIn(context, "test-admin");
  await page.goto("/admin/bookings");
  await expect(page.getByRole("heading", { name: "จัดการคำขอจองห้องประชุม" })).toBeVisible();
  await expect(page.getByRole("button", { name: "อนุมัติ", exact: true }).first()).toBeVisible();
  await expect(page.getByRole("button", { name: "ปฏิเสธ", exact: true }).first()).toBeVisible();
});

test("calendar loads bookings from the API per range and room, in Bangkok time", async ({ page, context }) => {
  await signIn(context, "test-user");
  const requests: URL[] = [];
  page.on("request", request => { if (request.url().includes("/api/bookings")) requests.push(new URL(request.url())); });

  await page.goto("/calendar");
  await page.getByRole("button", { name: new RegExp(CALENDAR_ROOM_NAME) }).click();
  const events = page.locator(".fc-event");
  await expect(events).toHaveCount(2);
  // Own booking shows its topic at 10:00 Bangkok time; someone else's is masked.
  await expect(events.filter({ hasText: "ประชุมของฉัน" })).toContainText("10:00");
  await expect(events.filter({ hasText: "จองแล้ว" })).toContainText("13:00");
  await expect(page.getByText("PRIVATE CALENDAR TOPIC")).toHaveCount(0);

  const roomRequest = requests.find(url => url.searchParams.get("roomId") === CALENDAR_ROOM);
  expect(roomRequest?.searchParams.get("start")).toMatch(/^\d{4}-\d{2}-\d{2}T00:00:00\+07:00$/);

  // Changing the visible range fetches again with the new range.
  const before = requests.length;
  await page.locator(".fc-next-button").click();
  await expect.poll(() => requests.length).toBeGreaterThan(before);
  const next = requests.at(-1) as URL;
  expect(next.searchParams.get("roomId")).toBe(CALENDAR_ROOM);
  expect(next.searchParams.get("start")).not.toBe(roomRequest?.searchParams.get("start"));
  await expect(events).toHaveCount(0);
});

test("booking form shows the signed-in requester from AuthContext", async ({ page, context }) => {
  await signIn(context, "test-other");
  await page.goto("/rooms/test-free/book");
  await expect(page.getByText("ข้อมูลผู้ขอจอง")).toBeVisible();
  await expect(page.getByText("other@example.test")).toBeVisible();
});
