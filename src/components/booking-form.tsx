"use client";

// Client Component: Booking Form with React Hook Form + Zod.
// Validates client-side for immediate feedback, then submits to the createBooking Server Action
// which enforces session identity and re-validates against database state.
// The requester card reads the signed-in user from AuthContext (useAuth) for display only.

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Calendar, Users, FileText, Send, Building2, AlertTriangle, CheckCircle2 } from "lucide-react";
import { bookingSchema, type BookingInput } from "@/schemas/booking";
import { createBooking } from "@/actions/bookings";
import { FieldError } from "@/components/ui";
import { useToast } from "@/context/toast-context";
import { useAuth } from "@/context/AuthContext";
import type { BookingActionResult } from "@/types/booking-actions";

interface BookingFormProps {
  room: {
    id: string;
    name: string;
    location: string;
    capacity: number;
    imageUrl?: string | null;
    isActive: boolean;
    equipment?: { id: string; name: string }[];
  };
  /** Not part of AuthContext, so the server page passes it in. */
  department?: string | null;
}

const timeOptions = [
  "08:00", "08:30", "09:00", "09:30", "10:00", "10:30",
  "11:00", "11:30", "12:00", "12:30", "13:00", "13:30",
  "14:00", "14:30", "15:00", "15:30", "16:00", "16:30",
  "17:00", "17:30", "18:00", "18:30", "19:00", "19:30", "20:00"
];

function getTomorrowDateString(): string {
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Bangkok",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(tomorrow);
}

export function BookingForm({ room, department }: BookingFormProps) {
  const currentUser = useAuth();
  const router = useRouter();
  const { toast } = useToast();
  const [result, setResult] = useState<BookingActionResult | null>(null);
  const [agreeTerms, setAgreeTerms] = useState(false);

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<BookingInput>({
    resolver: zodResolver(bookingSchema),
    mode: "onBlur",
    defaultValues: {
      roomId: room.id,
      topic: "",
      date: getTomorrowDateString(),
      startTime: "09:00",
      endTime: "11:00",
      attendeeCount: Math.min(room.capacity, 5),
      description: "",
    },
  });

  const onSubmit = async (values: BookingInput) => {
    if (!agreeTerms) {
      toast.warning("ข้อตกลงการใช้งาน", "กรุณายินยอมปฏิบัติตามระเบียบการใช้ห้อง");
      return;
    }

    setResult(null);
    try {
      const res = await createBooking(values);
      setResult(res);

      if (res.fieldErrors) {
        for (const [field, messages] of Object.entries(res.fieldErrors)) {
          if (
            field === "topic" ||
            field === "date" ||
            field === "startTime" ||
            field === "endTime" ||
            field === "attendeeCount" ||
            field === "description"
          ) {
            setError(field, { message: messages[0] });
          }
        }
      }

      if (res.success) {
        toast.success("ส่งคำขอจองสำเร็จ", res.message);
        router.push("/my-bookings");
      } else {
        toast.error("ส่งคำขอจองไม่สำเร็จ", res.message);
      }
    } catch {
      const errorMsg = "ไม่สามารถเชื่อมต่อกับเซิร์ฟเวอร์ได้ กรุณาลองใหม่อีกครั้ง";
      setResult({ success: false, message: errorMsg });
      toast.error("ข้อผิดพลาด", errorMsg);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
      {/* Left Column: Booking Form */}
      <div className="lg:col-span-2">
        <form
          className="surface-panel rounded-2xl border border-slate-200 bg-white p-6 sm:p-8 space-y-6 shadow-xs"
          noValidate
          onSubmit={handleSubmit(onSubmit)}
        >
          {result && (
            <div
              className={`notice${result.success ? "" : " error"}`}
              role={result.success ? "status" : "alert"}
            >
              {result.message}
            </div>
          )}

          {/* Section 1: Meeting Topic */}
          <div className="space-y-4">
            <h2 className="text-base font-bold text-slate-900 pb-2 border-b border-slate-100 flex items-center gap-2">
              <FileText className="w-4 h-4 text-blue-600" />
              <span>1. ข้อมูลการประชุม</span>
            </h2>

            <div className="space-y-1.5">
              <label htmlFor="booking-topic" className="text-xs font-semibold text-slate-700">
                หัวข้อ / ชื่องานประชุม <span className="text-rose-500">*</span>
              </label>
              <input
                id="booking-topic"
                type="text"
                placeholder="เช่น สัมมนาแลกเปลี่ยนความรู้วิชาการประจำภาคเรียน"
                maxLength={200}
                aria-invalid={!!errors.topic}
                aria-describedby={errors.topic ? "topic-error" : undefined}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm font-medium"
                {...register("topic")}
              />
              <FieldError id="topic-error" message={errors.topic?.message} />
            </div>

            <div className="space-y-1.5">
              <label htmlFor="booking-description" className="text-xs font-semibold text-slate-700">
                รายละเอียด / วัตถุประสงค์โดยสังเขป <span className="muted text-[11px]">(ไม่บังคับ)</span>
              </label>
              <textarea
                id="booking-description"
                rows={3}
                placeholder="ระบุวาระการประชุม หรือรายละเอียดอุปกรณ์ที่ต้องจัดเตรียมเพิ่มเติม..."
                maxLength={1000}
                aria-invalid={!!errors.description}
                aria-describedby={errors.description ? "description-error" : undefined}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm"
                {...register("description")}
              />
              <FieldError id="description-error" message={errors.description?.message} />
            </div>
          </div>

          {/* Section 2: Date & Time */}
          <div className="space-y-4 pt-2">
            <h2 className="text-base font-bold text-slate-900 pb-2 border-b border-slate-100 flex items-center gap-2">
              <Calendar className="w-4 h-4 text-blue-600" />
              <span>2. วันที่และช่วงเวลา</span>
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="space-y-1.5">
                <label htmlFor="booking-date" className="text-xs font-semibold text-slate-700">
                  วันที่ใช้งาน <span className="text-rose-500">*</span>
                </label>
                <input
                  id="booking-date"
                  type="date"
                  aria-invalid={!!errors.date}
                  aria-describedby={errors.date ? "date-error" : undefined}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-medium"
                  {...register("date")}
                />
                <FieldError id="date-error" message={errors.date?.message} />
              </div>

              <div className="space-y-1.5">
                <label htmlFor="booking-start" className="text-xs font-semibold text-slate-700">
                  เวลาเริ่ม <span className="text-rose-500">*</span>
                </label>
                <select
                  id="booking-start"
                  aria-invalid={!!errors.startTime}
                  aria-describedby={errors.startTime ? "start-error" : undefined}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-medium cursor-pointer"
                  {...register("startTime")}
                >
                  {timeOptions.slice(0, -1).map((t) => (
                    <option key={t} value={t}>
                      {t} น.
                    </option>
                  ))}
                </select>
                <FieldError id="start-error" message={errors.startTime?.message} />
              </div>

              <div className="space-y-1.5">
                <label htmlFor="booking-end" className="text-xs font-semibold text-slate-700">
                  เวลาสิ้นสุด <span className="text-rose-500">*</span>
                </label>
                <select
                  id="booking-end"
                  aria-invalid={!!errors.endTime}
                  aria-describedby={errors.endTime ? "end-error" : undefined}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-medium cursor-pointer"
                  {...register("endTime")}
                >
                  {timeOptions.slice(1).map((t) => (
                    <option key={t} value={t}>
                      {t} น.
                    </option>
                  ))}
                </select>
                <FieldError id="end-error" message={errors.endTime?.message} />
              </div>
            </div>

            {errors.endTime ? (
              <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-rose-600 flex-shrink-0" />
                <span>{errors.endTime.message}</span>
              </div>
            ) : (
              <div className="p-3 rounded-xl bg-blue-50 border border-blue-200 text-blue-800 text-xs flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-blue-600 flex-shrink-0" />
                <span>ระบบจะตรวจสอบเวลาซ้ำซ้อนระดับฐานข้อมูลเมื่อกดส่งคำขอ</span>
              </div>
            )}
          </div>

          {/* Section 3: Attendees */}
          <div className="space-y-4 pt-2">
            <h2 className="text-base font-bold text-slate-900 pb-2 border-b border-slate-100 flex items-center gap-2">
              <Users className="w-4 h-4 text-blue-600" />
              <span>3. จำนวนผู้เข้าร่วมประชุม</span>
            </h2>

            <div className="space-y-1.5">
              <div className="flex justify-between items-center">
                <label htmlFor="booking-attendees" className="text-xs font-semibold text-slate-700">
                  จำนวนคน <span className="text-rose-500">*</span>
                </label>
                <span className="text-[11px] text-slate-500">
                  ความจุห้องสูงสุด: {room.capacity} คน
                </span>
              </div>
              <input
                id="booking-attendees"
                type="number"
                min={1}
                max={room.capacity}
                aria-invalid={!!errors.attendeeCount}
                aria-describedby={errors.attendeeCount ? "attendee-error" : undefined}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm font-medium"
                {...register("attendeeCount", { valueAsNumber: true })}
              />
              <FieldError id="attendee-error" message={errors.attendeeCount?.message} />
            </div>
          </div>

          {/* Terms & Submit */}
          <div className="pt-4 border-t border-slate-100 space-y-4">
            <label className="flex items-start gap-2.5 cursor-pointer text-xs text-slate-600">
              <input
                type="checkbox"
                checked={agreeTerms}
                onChange={(e) => setAgreeTerms(e.target.checked)}
                className="mt-0.5 rounded border-slate-300 text-blue-600 focus:ring-blue-500 w-4 h-4"
              />
              <span className="leading-relaxed">
                ข้าพเจ้ายินยอมปฏิบัติตามระเบียบการใช้ห้องประชุม ดูแลรักษาความสะอาด
                และรับผิดชอบต่อทรัพย์สินของมหาวิทยาลัยตลอดช่วงเวลาที่เข้าใช้งาน
              </span>
            </label>

            <button
              type="submit"
              disabled={!room.isActive || isSubmitting}
              className={`w-full py-3.5 rounded-xl text-sm font-bold flex items-center justify-center gap-2 transition-all shadow-md ${
                !room.isActive || isSubmitting
                  ? "bg-slate-200 text-slate-400 cursor-not-allowed shadow-none"
                  : "bg-blue-600 hover:bg-blue-700 text-white shadow-blue-700/20 active:scale-[0.99] cursor-pointer"
              }`}
            >
              {isSubmitting ? (
                <span>กำลังส่งคำขอจองห้อง…</span>
              ) : (
                <>
                  <Send className="w-4 h-4" />
                  <span>
                    {room.isActive ? "ยืนยันและส่งคำขอจองห้อง" : "ห้องนี้ปิดใช้งาน"}
                  </span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>

      {/* Right Column: Room & Requester Summary */}
      <div className="space-y-6">
        <div className="surface-panel rounded-2xl border border-slate-200 bg-white p-5 space-y-4 shadow-xs">
          <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
            ห้องประชุมที่เลือก
          </div>

          {room.imageUrl && (
            <div className="aspect-video w-full rounded-xl overflow-hidden bg-slate-100">
              <img
                src={room.imageUrl}
                alt={room.name}
                className="w-full h-full object-cover"
              />
            </div>
          )}

          <div>
            <h3 className="text-base font-bold text-slate-900 mt-1">
              {room.name}
            </h3>
            <div className="text-xs text-slate-500 flex items-center gap-1.5 mt-0.5">
              <Building2 className="w-3.5 h-3.5" />
              <span>{room.location}</span>
            </div>
          </div>

          <div className="pt-3 border-t border-slate-100 text-xs space-y-2 text-slate-600">
            <div className="flex justify-between">
              <span>ความจุห้อง:</span>
              <span className="font-semibold text-slate-900">
                {room.capacity} คน
              </span>
            </div>
            <div className="flex justify-between">
              <span>สถานะ:</span>
              <span className={`font-semibold ${room.isActive ? "text-emerald-600" : "text-rose-600"}`}>
                {room.isActive ? "เปิดใช้งาน" : "ปิดปรับปรุง"}
              </span>
            </div>
          </div>

          {room.equipment && room.equipment.length > 0 && (
            <div className="pt-3 border-t border-slate-100">
              <div className="text-xs font-semibold text-slate-700 mb-2">อุปกรณ์ประจำห้อง:</div>
              <ul className="flex flex-wrap gap-1.5 text-[11px] text-slate-600">
                {room.equipment.map((eq) => (
                  <li key={eq.id} className="px-2 py-0.5 rounded-md bg-slate-100">
                    {eq.name}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        {/* User Card */}
        {currentUser && (
          <div className="rounded-2xl border border-slate-200 bg-slate-50/70 p-5 space-y-3 text-xs">
            <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
              ข้อมูลผู้ขอจอง
            </div>
            <div className="font-bold text-slate-900 text-sm">
              {currentUser.name}
            </div>
            <div className="text-slate-500">
              {currentUser.email}
            </div>
            {department && (
              <div className="text-slate-600">
                หน่วยงาน: {department}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
