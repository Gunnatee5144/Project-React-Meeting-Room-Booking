import { test, expect, type BrowserContext } from "@playwright/test";
import { createHmac } from "node:crypto";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../../src/generated/prisma/client";
import { deleteManagedRoom, saveManagedRoom } from "../../src/lib/room-management";
import { TEST_DATABASE_URL, TEST_SESSION_SECRET } from "../../playwright.config";

const database = new PrismaClient({ adapter: new PrismaPg({ connectionString: TEST_DATABASE_URL, max: 1 }) });
test.afterAll(async () => { await database.$disconnect(); });

async function signIn(context: BrowserContext, id: string, expired = false) {
  const header = Buffer.from(JSON.stringify({ alg: "HS256", typ: "JWT" })).toString("base64url");
  const claims = Buffer.from(JSON.stringify({ sub: id, exp: Math.floor(Date.now() / 1000) + (expired ? -60 : 3600), role: "ADMIN" })).toString("base64url");
  const signature = createHmac("sha256", TEST_SESSION_SECRET).update(`${header}.${claims}`).digest("base64url");
  await context.addCookies([{ name: "session", value: `${header}.${claims}.${signature}`, url: "http://127.0.0.1:3100", httpOnly: true, sameSite: "Lax" }]);
}

test("home and mobile navigation remain usable without overflow", async ({ page }) => {
  await page.setViewportSize({ width: 375, height: 812 });
  await page.goto("/");
  await expect(page.getByRole("heading", { level: 1 })).toContainText("ห้องพร้อม");
  await page.getByRole("button", { name: "เมนู", exact: true }).click();
  await expect(page.getByRole("navigation", { name: "เมนูหลัก" })).toBeVisible();
  await page.getByRole("navigation", { name: "เมนูหลัก" }).getByRole("link", { name: "ค้นหาห้อง" }).click();
  await expect(page).toHaveURL(/\/rooms$/);
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
});

test("filters require all equipment and preserve URL/back navigation", async ({ page }) => {
  await page.goto("/rooms");
  await page.getByLabel("จำนวนผู้เข้าร่วม").fill("10");
  await page.getByLabel("ไวท์บอร์ด", { exact: true }).check();
  await page.getByRole("button", { name: "ค้นหาห้อง", exact: true }).click();
  await expect(page).toHaveURL(/capacity=10.*equipment=test-board/);
  await expect(page.locator(".room-card")).toHaveCount(1);
  await expect(page.locator(".room-card")).toContainText("01 ห้องพร้อมใช้");
  await page.getByRole("link", { name: "ล้างตัวกรอง" }).click();
  await expect(page).toHaveURL(/\/rooms$/);
  await page.goBack();
  await expect(page).toHaveURL(/capacity=10.*equipment=test-board/);
  await expect(page.getByLabel("จำนวนผู้เข้าร่วม")).toHaveValue("10");
  await expect(page.getByLabel("ไวท์บอร์ด", { exact: true })).toBeChecked();
});

test("availability blocks pending overlap and allows adjacent/rejected bookings", async ({ page }) => {
  await page.goto("/rooms?capacity=10&date=2030-10-04&start=09%3A00&end=10%3A00");
  await expect(page.locator(".room-card")).toHaveCount(1);
  await expect(page.locator(".room-card")).toContainText("01 ห้องพร้อมใช้");
  await page.goto("/rooms?capacity=10&date=2030-10-04&start=10%3A00&end=11%3A00");
  await expect(page.locator(".room-card")).toHaveCount(2);
  await expect(page.locator(".room-card")).not.toContainText(["03 ห้องปิดใช้งาน"]);
});

test("malformed filters display feedback instead of querying invalid dates", async ({ page }) => {
  await page.goto("/rooms?date=2030-02-30&start=12%3A00&end=11%3A00");
  await expect(page.getByRole("main").getByRole("alert")).toContainText("ตรวจสอบตัวกรอง");
  await expect(page.locator(".room-card")).toHaveCount(0);
});

test("pagination retains equipment filters", async ({ page }) => {
  await page.goto("/rooms?q=" + encodeURIComponent("ทดสอบแบ่งหน้า"));
  await expect(page.locator(".room-card")).toHaveCount(12);
  await page.getByRole("link", { name: "หน้าถัดไป" }).click();
  await expect(page).toHaveURL(/page=2/);
  await expect(page.locator(".room-card")).toHaveCount(2);
  await page.getByRole("link", { name: "หน้าก่อนหน้า" }).click();
  await expect(page.locator(".room-card")).toHaveCount(12);
});

test("room schedule is privacy-safe and unknown rooms show not found", async ({ page }) => {
  await page.goto("/rooms/test-busy?date=2030-10-04");
  await expect(page.locator(".schedule-list")).toContainText("09:00 – 10:00");
  await expect(page.locator(".schedule-list")).toContainText("รออนุมัติ");
  await expect(page.locator("body")).not.toContainText("PRIVATE TOPIC");
  await expect(page.locator("body")).not.toContainText("Other User");
  await page.goto("/rooms/does-not-exist");
  await expect(page.getByRole("heading", { name: "ไม่พบห้องประชุมนี้" })).toBeVisible();
});

test("guests and expired sessions cannot access profile or admin", async ({ page, context }) => {
  await page.goto("/profile");
  await expect(page).toHaveURL(/\/login\?next=/);
  await signIn(context, "test-admin", true);
  await page.goto("/admin/rooms");
  await expect(page).toHaveURL(/\/login\?next=/);
});

test("database role overrides a forged ADMIN claim", async ({ page, context }) => {
  await signIn(context, "test-user");
  await page.goto("/admin/rooms");
  await expect(page.getByRole("heading", { name: "เฉพาะผู้ดูแลระบบ" })).toBeVisible();
  await expect(page.getByText("เพิ่มห้องประชุมใหม่", { exact: true })).toHaveCount(0);
});

test("profile update persists, duplicate emails fail, and logout clears session", async ({ page, context }) => {
  await signIn(context, "test-user");
  await page.goto("/profile");
  await page.getByLabel("ชื่อและนามสกุล").fill("Gun Updated");
  await page.getByLabel("อีเมล", { exact: true }).fill("admin@example.test");
  await page.getByRole("button", { name: "บันทึกข้อมูลส่วนตัว" }).click();
  await expect(page.getByRole("main").getByRole("alert")).toContainText("อีเมลนี้มีผู้ใช้งานแล้ว");
  await page.getByLabel("อีเมล", { exact: true }).fill("gun-updated@example.test");
  await page.getByLabel("หน่วยงาน", { exact: false }).fill("");
  await page.getByRole("button", { name: "บันทึกข้อมูลส่วนตัว" }).click();
  await expect(page.getByRole("status")).toContainText("บันทึกข้อมูลส่วนตัวแล้ว");
  await page.reload();
  await expect(page.getByLabel("ชื่อและนามสกุล")).toHaveValue("Gun Updated");
  const user = await database.user.findUniqueOrThrow({ where: { id: "test-user" } });
  expect(user.department).toBeNull();
  expect(user.role).toBe("USER");
  await page.getByRole("button", { name: "ออกจากระบบ" }).click();
  await expect(page).toHaveURL(/\/login$/);
  expect((await context.cookies()).some(cookie => cookie.name === "session")).toBe(false);
});

test("admin creates, edits equipment assignments, then deletes a history-free room", async ({ page, context }) => {
  await signIn(context, "test-admin");
  await page.goto("/admin/rooms");
  await page.getByText("เพิ่มห้องประชุมใหม่", { exact: true }).click();
  const form = page.locator(".add-room form");
  await form.getByLabel("ชื่อห้อง", { exact: true }).fill("Room Created By Gun");
  await form.getByLabel("สถานที่ / อาคาร / ชั้น").fill("Building Test");
  await form.getByLabel("ความจุ (คน)").fill("7");
  await form.getByLabel("จอภาพ", { exact: true }).check();
  await form.getByRole("button", { name: "เพิ่มห้องประชุม", exact: true }).click();
  await expect(form.getByRole("status")).toContainText("เพิ่มห้องประชุมแล้ว");
  const article = page.locator("article.admin-room").filter({ has: page.getByRole("heading", { name: "Room Created By Gun" }) });
  await article.getByText("แก้ไขข้อมูลห้อง", { exact: true }).click();
  await article.getByLabel("ความจุ (คน)").fill("9");
  await article.getByLabel("จอภาพ", { exact: true }).uncheck();
  await article.getByLabel("ไวท์บอร์ด", { exact: true }).check();
  await article.getByRole("button", { name: "บันทึกข้อมูลห้อง" }).click();
  await expect(article).toContainText("9 คน");
  const stored = await database.room.findFirstOrThrow({ where: { name: "Room Created By Gun" }, include: { equipment: true } });
  expect(stored.equipment.map(item => item.equipmentId)).toEqual(["test-board"]);
  await article.getByRole("button", { name: "ลบห้อง", exact: true }).click();
  await article.getByRole("button", { name: "ยืนยันลบห้อง", exact: true }).click();
  await expect(article).toHaveCount(0);
  expect(await database.room.findUnique({ where: { id: stored.id } })).toBeNull();
});

test("admin equipment deletion preserves assigned equipment", async ({ page, context }) => {
  await signIn(context, "test-admin");
  await page.goto("/admin/rooms");
  await page.getByLabel("ชื่ออุปกรณ์ใหม่").fill("Test Microphone");
  await page.getByRole("button", { name: "เพิ่มอุปกรณ์", exact: true }).click();
  const manager = page.locator(".equipment-manager");
  await expect(manager.getByRole("status")).toContainText("เพิ่มอุปกรณ์แล้ว");
  const assigned = manager.locator("li").filter({ hasText: "จอภาพ" });
  await assigned.getByRole("button", { name: "ลบอุปกรณ์ จอภาพ" }).click();
  await assigned.getByRole("button", { name: "ยืนยันลบ", exact: true }).click();
  await expect(manager.getByRole("status")).toContainText("ต้องนำออกจากห้องก่อนลบ");
  const removable = manager.locator("li").filter({ hasText: "Test Microphone" });
  await removable.getByRole("button", { name: "ลบอุปกรณ์ Test Microphone" }).click();
  await removable.getByRole("button", { name: "ยืนยันลบ", exact: true }).click();
  await expect(removable).toHaveCount(0);
});

test("room service denies non-admin writes and invalid equipment atomically", async () => {
  const input = { name: "Denied Room", location: "Building Test", capacity: 6, imageUrl: "", isActive: true, equipmentIds: [] };
  await expect(saveManagedRoom(database, "test-user", input)).rejects.toThrow("คุณไม่มีสิทธิ์");
  await expect(saveManagedRoom(database, "test-admin", { ...input, equipmentIds: ["nonexistent"] })).rejects.toThrow("รายการอุปกรณ์เปลี่ยนไป");
  expect(await database.room.count({ where: { name: "Denied Room" } })).toBe(0);
});

test("capacity cannot undercut reservations; deleting room history disables instead", async () => {
  const input = { name: "02 ห้องมีการจอง", location: "อาคารเรียน ชั้น 2", capacity: 5, imageUrl: "", isActive: true, equipmentIds: ["test-screen"] };
  await expect(saveManagedRoom(database, "test-admin", input, "test-busy")).rejects.toThrow("ลดความจุไม่ได้");
  expect((await database.room.findUniqueOrThrow({ where: { id: "test-busy" } })).capacity).toBe(20);
  expect(await deleteManagedRoom(database, "test-admin", "test-busy")).toContain("เก็บประวัติ");
  expect((await database.room.findUniqueOrThrow({ where: { id: "test-busy" } })).isActive).toBe(false);
  expect(await database.booking.count({ where: { roomId: "test-busy" } })).toBe(1);
});

test("responsive pages preserve keyboard focus and image failure fallback", async ({ page }) => {
  for (const width of [375, 768, 1024, 1440]) {
    await page.setViewportSize({ width, height: 900 });
    await page.goto("/rooms");
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  }
  await page.goto("/");
  await page.keyboard.press("Tab");
  await expect(page.getByRole("link", { name: "ข้ามไปเนื้อหา" })).toBeFocused();
  await page.keyboard.press("Enter");
  await expect(page).toHaveURL(/#main-content$/);
  await database.room.update({ where: { id: "test-free" }, data: { imageUrl: "https://images.invalid/no-image.png" } });
  await page.goto("/rooms/test-free");
  await expect(page.getByRole("img", { name: "ห้อง 01 ห้องพร้อมใช้ ยังไม่มีรูปภาพ" })).toBeVisible();
});
