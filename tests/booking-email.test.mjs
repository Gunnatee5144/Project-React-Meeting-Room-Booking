import assert from "node:assert/strict";
import { test } from "node:test";
import { sendBookingReviewEmail } from "../src/lib/email/mailer.ts";

test("sendBookingReviewEmail simulates email when SMTP is unconfigured", async () => {
  const result = await sendBookingReviewEmail({
    to: "student@cmu.ac.th",
    userName: "ณฤกส ปันด้วง",
    roomName: "ห้องประชุม 101",
    roomLocation: "อาคารเรียน 1 ชั้น 2",
    topic: "สัมมนาโปรเจกต์ React",
    startTime: new Date("2026-10-10T09:00:00+07:00"),
    endTime: new Date("2026-10-10T11:00:00+07:00"),
    status: "APPROVED",
    adminNote: "อนุมัติคำขอจองตามระเบียบ",
  });

  assert.equal(result.success, true);
  assert.equal(result.simulated, true);
});

test("sendBookingReviewEmail handles rejection status correctly", async () => {
  const result = await sendBookingReviewEmail({
    to: "student@cmu.ac.th",
    userName: "ณฤกส ปันด้วง",
    roomName: "ห้องประชุม 101",
    topic: "สัมมนาโปรเจกต์ React",
    startTime: new Date("2026-10-10T09:00:00+07:00"),
    endTime: new Date("2026-10-10T11:00:00+07:00"),
    status: "REJECTED",
    adminNote: "ห้องปิดปรับปรุงระบบไฟฟ้า",
  });

  assert.equal(result.success, true);
  assert.equal(result.simulated, true);
});
