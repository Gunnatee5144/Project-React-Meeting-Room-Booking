import { z } from "zod";

export type SearchParams = Record<string, string | string[] | undefined>;
export const ROOM_PAGE_SIZE = 12;
export const THAI_TIME_ZONE = "Asia/Bangkok";

export function bangkokDate(date = new Date()): string {
  return new Intl.DateTimeFormat("en-CA", { timeZone: THAI_TIME_ZONE, year: "numeric", month: "2-digit", day: "2-digit" }).format(date);
}

export function parseBangkokDateTime(date: string, time: string): Date | null {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date) || !/^\d{2}:\d{2}$/.test(time)) return null;
  const [year, month, day] = date.split("-").map(Number);
  const [hour, minute] = time.split(":").map(Number);
  if (year < 2000 || year > 2100 || hour > 23 || minute > 59) return null;
  const calendar = new Date(Date.UTC(year, month - 1, day));
  if (calendar.getUTCFullYear() !== year || calendar.getUTCMonth() !== month - 1 || calendar.getUTCDate() !== day) return null;
  return new Date(`${date}T${time}:00+07:00`);
}

const single = (value: string | string[] | undefined) => Array.isArray(value) ? value[0] ?? "" : value ?? "";
const optionalPositiveInteger = z.string().refine(value => value === "" || (/^\d+$/.test(value) && Number(value) >= 1 && Number(value) <= 10000), "ระบุจำนวนเต็มตั้งแต่ 1 ถึง 10,000");

export const roomFilterSchema = z.object({
  q: z.string().trim().max(100, "คำค้นหาต้องไม่เกิน 100 ตัวอักษร"),
  capacity: optionalPositiveInteger,
  date: z.string(), start: z.string(), end: z.string(),
  equipment: z.array(z.string().min(1).max(100)).max(25, "เลือกอุปกรณ์ได้ไม่เกิน 25 รายการ"),
  page: z.string().regex(/^\d+$/, "หน้าที่เลือกไม่ถูกต้อง").refine(value => Number(value) >= 1 && Number(value) <= 100000, "หน้าที่เลือกไม่ถูกต้อง"),
}).superRefine((value, context) => {
  if (!value.date && !value.start && !value.end) return;
  const start = parseBangkokDateTime(value.date, value.start);
  const end = parseBangkokDateTime(value.date, value.end);
  if (!start) context.addIssue({ code: "custom", path: ["start"], message: "ระบุวันที่และเวลาเริ่มให้ครบและถูกต้อง" });
  if (!end) context.addIssue({ code: "custom", path: ["end"], message: "ระบุวันที่และเวลาสิ้นสุดให้ครบและถูกต้อง" });
  if (start && end && end <= start) context.addIssue({ code: "custom", path: ["end"], message: "เวลาสิ้นสุดต้องหลังเวลาเริ่มในวันเดียวกัน" });
});

export type RoomFilters = z.infer<typeof roomFilterSchema>;

export function readRoomFilters(params: SearchParams): RoomFilters {
  const rawEquipment = params.equipment;
  return {
    q: single(params.q), capacity: single(params.capacity), date: single(params.date),
    start: single(params.start), end: single(params.end),
    equipment: [...new Set(Array.isArray(rawEquipment) ? rawEquipment : rawEquipment ? [rawEquipment] : [])],
    page: single(params.page) || "1",
  };
}

export function buildRoomWhere(filters: RoomFilters) {
  const startTime = filters.date ? parseBangkokDateTime(filters.date, filters.start) : null;
  const endTime = filters.date ? parseBangkokDateTime(filters.date, filters.end) : null;
  return {
    isActive: true,
    ...(filters.q ? { OR: [{ name: { contains: filters.q, mode: "insensitive" as const } }, { location: { contains: filters.q, mode: "insensitive" as const } }] } : {}),
    ...(filters.capacity ? { capacity: { gte: Number(filters.capacity) } } : {}),
    ...(filters.equipment.length ? { AND: filters.equipment.map(equipmentId => ({ equipment: { some: { equipmentId } } })) } : {}),
    ...(startTime && endTime ? { bookings: { none: {
      status: { in: ["PENDING" as const, "APPROVED" as const] },
      startTime: { lt: endTime }, endTime: { gt: startTime },
    } } } : {}),
  };
}

export function roomSearchUrl(filters: RoomFilters, page: number): string {
  const query = new URLSearchParams();
  for (const key of ["q", "capacity", "date", "start", "end"] as const) if (filters[key]) query.set(key, filters[key]);
  filters.equipment.forEach(id => query.append("equipment", id));
  if (page > 1) query.set("page", String(page));
  return `/rooms${query.size ? `?${query}` : ""}`;
}

export function dayWindow(date: string) {
  const start = parseBangkokDateTime(date, "00:00");
  return start ? { start, end: new Date(start.getTime() + 24 * 60 * 60 * 1000) } : null;
}

export function formatThaiTime(date: Date): string {
  return new Intl.DateTimeFormat("th-TH", { timeZone: THAI_TIME_ZONE, hour: "2-digit", minute: "2-digit", hourCycle: "h23" }).format(date);
}

export function formatThaiDate(date: Date): string {
  return new Intl.DateTimeFormat("th-TH", { timeZone: THAI_TIME_ZONE, dateStyle: "long" }).format(date);
}
