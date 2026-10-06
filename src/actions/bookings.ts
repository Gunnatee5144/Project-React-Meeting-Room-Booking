"use server";

// Server Actions (mutations) for Booking workflow:
// Handled by Jeff (682110169 ณฤกส ปันด้วง)
// Enforces user session, conflict detection, advance window, attendee limits,
// and sends email notifications upon review.

import { revalidatePath } from "next/cache";
import { getRoomViewer } from "@/lib/room-access";
import { getPrisma } from "@/lib/prisma";
import { parseBangkokDateTime } from "@/lib/room-filters";
import {
  bookingSchema,
  bookingIdSchema,
  cancelBookingSchema,
  reviewBookingSchema,
} from "@/schemas/booking";
import { sendBookingReviewEmail } from "@/lib/email/mailer";
import type { BookingActionResult } from "@/types/booking-actions";

function refreshBookingViews(roomId?: string) {
  for (const path of ["/", "/rooms", "/calendar", "/my-bookings", "/admin/bookings", "/admin/reports"]) {
    revalidatePath(path);
  }
  if (roomId) {
    revalidatePath(`/rooms/${roomId}`);
    revalidatePath(`/rooms/${roomId}/book`);
  } else {
    revalidatePath("/rooms/[id]", "page");
  }
}

export async function createBooking(input: unknown): Promise<BookingActionResult> {
  const user = await getRoomViewer();
  if (!user) {
    return { success: false, message: "กรุณาเข้าสู่ระบบก่อนจองห้องประชุม" };
  }

  const parsed = bookingSchema.safeParse(input);
  if (!parsed.success) {
    return {
      success: false,
      message: "ข้อมูลการจองไม่ถูกต้อง",
      fieldErrors: parsed.error.flatten().fieldErrors,
    };
  }

  const startTime = parseBangkokDateTime(parsed.data.date, parsed.data.startTime);
  const endTime = parseBangkokDateTime(parsed.data.date, parsed.data.endTime);
  if (!startTime || !endTime) {
    return { success: false, message: "รูปแบบวันหรือเวลาไม่ถูกต้อง" };
  }

  try {
    const prisma = getPrisma();
    const room = await prisma.room.findUnique({
      where: { id: parsed.data.roomId },
      select: { id: true, name: true, capacity: true, isActive: true },
    });

    if (!room) {
      return { success: false, message: "ไม่พบห้องประชุมที่เลือก" };
    }
    if (!room.isActive) {
      return { success: false, message: "ห้องประชุมนี้ปิดปรับปรุง ไม่สามารถส่งคำขอจองได้" };
    }
    if (parsed.data.attendeeCount > room.capacity) {
      return {
        success: false,
        message: `จำนวนผู้เข้าร่วมเกินความจุห้อง (รองรับสูงสุด ${room.capacity} คน)`,
        fieldErrors: { attendeeCount: [`ห้องนี้รองรับได้สูงสุด ${room.capacity} คน`] },
      };
    }

    // Strict overlap check with any PENDING or APPROVED bookings
    const overlap = await prisma.booking.findFirst({
      where: {
        roomId: room.id,
        status: { in: ["PENDING", "APPROVED"] },
        startTime: { lt: endTime },
        endTime: { gt: startTime },
      },
    });

    if (overlap) {
      return {
        success: false,
        message: "ช่วงเวลาดังกล่าวมีคำขอจองหรือได้รับการอนุมัติแล้ว กรุณาเลือกช่วงเวลาอื่น",
      };
    }

    const booking = await prisma.booking.create({
      data: {
        roomId: room.id,
        userId: user.id,
        topic: parsed.data.topic,
        startTime,
        endTime,
        attendeeCount: parsed.data.attendeeCount,
        status: "PENDING",
      },
    });

    refreshBookingViews(room.id);
    return {
      success: true,
      message: "ส่งคำขอจองห้องประชุมเรียบร้อยแล้ว (รอผู้ดูแลอนุมัติ)",
      bookingId: booking.id,
    };
  } catch (error) {
    console.error("Booking creation failed:", error);
    return { success: false, message: "บันทึกการจองไม่สำเร็จ กรุณาลองใหม่อีกครั้ง" };
  }
}

export async function updateBooking(id: unknown, input: unknown): Promise<BookingActionResult> {
  const user = await getRoomViewer();
  if (!user) {
    return { success: false, message: "กรุณาเข้าสู่ระบบก่อนแก้ไขการจอง" };
  }

  const parsedId = bookingIdSchema.safeParse(id);
  if (!parsedId.success) {
    return { success: false, message: "รหัสการจองไม่ถูกต้อง" };
  }

  const parsed = bookingSchema.safeParse(input);
  if (!parsed.success) {
    return {
      success: false,
      message: "ข้อมูลการจองไม่ถูกต้อง",
      fieldErrors: parsed.error.flatten().fieldErrors,
    };
  }

  const startTime = parseBangkokDateTime(parsed.data.date, parsed.data.startTime);
  const endTime = parseBangkokDateTime(parsed.data.date, parsed.data.endTime);
  if (!startTime || !endTime) {
    return { success: false, message: "รูปแบบวันหรือเวลาไม่ถูกต้อง" };
  }

  try {
    const prisma = getPrisma();
    const existing = await prisma.booking.findUnique({
      where: { id: parsedId.data },
    });

    if (!existing) {
      return { success: false, message: "ไม่พบข้อมูลการจองนี้" };
    }
    if (existing.userId !== user.id && user.role !== "ADMIN") {
      return { success: false, message: "คุณไม่มีสิทธิ์แก้ไขการจองนี้" };
    }
    if (existing.status !== "PENDING" && existing.status !== "APPROVED") {
      return { success: false, message: "ไม่สามารถแก้ไขรายการที่ยกเลิกหรือไม่อนุมัติแล้วได้" };
    }
    if (existing.startTime.getTime() <= Date.now()) {
      return { success: false, message: "ไม่สามารถแก้ไขการจองที่เลยเวลาเริ่มใช้งานแล้วได้" };
    }

    const room = await prisma.room.findUnique({
      where: { id: parsed.data.roomId },
      select: { id: true, capacity: true, isActive: true },
    });
    if (!room || !room.isActive) {
      return { success: false, message: "ห้องประชุมที่เลือกไม่พร้อมใช้งาน" };
    }
    if (parsed.data.attendeeCount > room.capacity) {
      return {
        success: false,
        message: `จำนวนผู้เข้าร่วมเกินความจุห้อง (${room.capacity} คน)`,
        fieldErrors: { attendeeCount: [`ห้องนี้รองรับได้สูงสุด ${room.capacity} คน`] },
      };
    }

    // Overlap check excluding self
    const overlap = await prisma.booking.findFirst({
      where: {
        roomId: room.id,
        id: { not: existing.id },
        status: { in: ["PENDING", "APPROVED"] },
        startTime: { lt: endTime },
        endTime: { gt: startTime },
      },
    });

    if (overlap) {
      return {
        success: false,
        message: "ช่วงเวลาดังกล่าวมีการจองแล้ว กรุณาเลือกช่วงเวลาอื่น",
      };
    }

    // Revert to PENDING after update so admin can re-review
    await prisma.booking.update({
      where: { id: existing.id },
      data: {
        roomId: room.id,
        topic: parsed.data.topic,
        startTime,
        endTime,
        attendeeCount: parsed.data.attendeeCount,
        status: "PENDING",
      },
    });

    refreshBookingViews(room.id);
    return {
      success: true,
      message: "แก้ไขคำขอจองเรียบร้อยแล้ว (สถานะเปลี่ยนเป็นรอตรวจสอบใหม่)",
    };
  } catch (error) {
    console.error("Booking update failed:", error);
    return { success: false, message: "แก้ไขการจองไม่สำเร็จ กรุณาลองใหม่อีกครั้ง" };
  }
}

export async function cancelBooking(id: unknown, reason?: unknown): Promise<BookingActionResult> {
  const user = await getRoomViewer();
  if (!user) {
    return { success: false, message: "กรุณาเข้าสู่ระบบก่อนยกเลิกการจอง" };
  }

  const parsed = cancelBookingSchema.safeParse({ id, reason });
  if (!parsed.success) {
    return { success: false, message: "รหัสการจองหรือข้อมูลไม่ถูกต้อง" };
  }

  try {
    const prisma = getPrisma();
    const existing = await prisma.booking.findUnique({
      where: { id: parsed.data.id },
      select: { id: true, userId: true, roomId: true, startTime: true, status: true, adminNote: true },
    });

    if (!existing) {
      return { success: false, message: "ไม่พบข้อมูลการจองนี้" };
    }
    if (existing.userId !== user.id && user.role !== "ADMIN") {
      return { success: false, message: "คุณไม่มีสิทธิ์ยกเลิกการจองนี้" };
    }
    if (existing.status !== "PENDING" && existing.status !== "APPROVED") {
      return { success: false, message: "รายการนี้ไม่อยู่ในสถานะที่สามารถยกเลิกได้" };
    }

    // Cancel rule: at least 1 hour before start
    const diffMs = existing.startTime.getTime() - Date.now();
    if (diffMs < 60 * 60 * 1000) {
      return {
        success: false,
        message: "สามารถยกเลิกการจองล่วงหน้าได้อย่างน้อย 1 ชั่วโมงก่อนถึงเวลาเริ่มใช้งาน",
      };
    }

    const cancelNote = parsed.data.reason
      ? `ยกเลิกโดยผู้ใช้: ${parsed.data.reason}`
      : existing.adminNote;

    await prisma.booking.update({
      where: { id: existing.id },
      data: {
        status: "CANCELLED",
        adminNote: cancelNote,
      },
    });

    refreshBookingViews(existing.roomId);
    return { success: true, message: "ยกเลิกคำขอจองห้องประชุมเรียบร้อยแล้ว" };
  } catch (error) {
    console.error("Booking cancellation failed:", error);
    return { success: false, message: "ยกเลิกการจองไม่สำเร็จ กรุณาลองใหม่อีกครั้ง" };
  }
}

export async function reviewBooking(id: unknown, input: unknown): Promise<BookingActionResult> {
  const actor = await getRoomViewer();
  if (actor?.role !== "ADMIN") {
    return { success: false, message: "คุณไม่มีสิทธิ์อนุมัติหรือปฏิเสธคำขอจอง" };
  }

  const parsed = reviewBookingSchema.safeParse({
    id,
    ...(typeof input === "object" && input !== null ? input : {}),
  });
  if (!parsed.success) {
    return {
      success: false,
      message: "ข้อมูลการพิจารณาไม่ถูกต้อง",
      fieldErrors: parsed.error.flatten().fieldErrors,
    };
  }

  try {
    const prisma = getPrisma();
    const existing = await prisma.booking.findUnique({
      where: { id: parsed.data.id },
      include: { room: true, user: true },
    });

    if (!existing) {
      return { success: false, message: "ไม่พบคำขอจองนี้" };
    }
    if (existing.status === "CANCELLED") {
      return { success: false, message: "คำขอนี้ถูกยกเลิกไปแล้ว ไม่สามารถพิจารณาได้" };
    }

    // If approving, re-check that no already-approved booking conflicts
    if (parsed.data.status === "APPROVED") {
      const conflict = await prisma.booking.findFirst({
        where: {
          roomId: existing.roomId,
          id: { not: existing.id },
          status: "APPROVED",
          startTime: { lt: existing.endTime },
          endTime: { gt: existing.startTime },
        },
      });
      if (conflict) {
        return {
          success: false,
          message: "ไม่สามารถอนุมัติได้ เนื่องจากมีรายการอื่นที่ได้รับการอนุมัติในช่วงเวลาเดียวกันแล้ว",
        };
      }
    }

    const updated = await prisma.booking.update({
      where: { id: existing.id },
      data: {
        status: parsed.data.status,
        adminNote: parsed.data.adminNote || null,
        reviewedById: actor.id,
      },
      include: { room: true, user: true },
    });

    // Send email notification via Nodemailer / SMTP
    if (updated.user?.email) {
      try {
        await sendBookingReviewEmail({
          to: updated.user.email,
          userName: updated.user.name,
          roomName: updated.room.name,
          roomLocation: updated.room.location,
          topic: updated.topic,
          startTime: updated.startTime,
          endTime: updated.endTime,
          status: parsed.data.status,
          adminNote: updated.adminNote,
        });
      } catch (emailErr) {
        console.error("Non-fatal email sending error:", emailErr);
      }
    }

    refreshBookingViews(existing.roomId);
    return {
      success: true,
      message:
        parsed.data.status === "APPROVED"
          ? "อนุมัติคำขอจองห้องประชุมเรียบร้อยแล้ว"
          : "ปฏิเสธคำขอจองห้องประชุมเรียบร้อยแล้ว",
    };
  } catch (error) {
    console.error("Booking review failed:", error);
    return { success: false, message: "ดำเนินการไม่สำเร็จ กรุณาลองใหม่อีกครั้ง" };
  }
}
