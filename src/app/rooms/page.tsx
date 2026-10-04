// Server Component using SSR on purpose: results depend on searchParams (date, time, capacity,
// equipment) and on live PENDING/APPROVED bookings. A cached or prerendered page could show a
// booked room as free, so force-dynamic keeps every request fresh. No client JS is needed to list rooms.

import Link from "next/link";
import { PageHeading, EmptyState } from "@/components/ui";
import { RoomFilterForm } from "@/components/room-filters";
import { RoomCard } from "@/components/room-card";
import { listEquipment, searchRooms } from "@/lib/rooms";
import { readRoomFilters, roomFilterSchema, roomSearchUrl, ROOM_PAGE_SIZE, type SearchParams } from "@/lib/room-filters";

export const dynamic = "force-dynamic";

export default async function RoomsPage({ searchParams }: { searchParams: Promise<SearchParams> }) {
  const raw = readRoomFilters(await searchParams);
  const parsed = roomFilterSchema.safeParse(raw);
  const filters = parsed.success ? parsed.data : raw;
  const ready = Boolean(process.env.DATABASE_URL);
  const equipment = ready ? await listEquipment() : [];
  const result = ready && parsed.success ? await searchRooms(parsed.data) : null;
  const page = Number(filters.page);
  return <>
    <PageHeading eyebrow="พื้นที่สำหรับทีมของคุณ" title="ค้นหาห้องประชุม" description="เลือกห้องตามจำนวนคน อุปกรณ์ และช่วงเวลาที่ต้องการ" />
    <RoomFilterForm filters={filters} equipment={equipment} />
    {!parsed.success && <div className="notice error" role="alert"><p>ตรวจสอบตัวกรองก่อนค้นหา</p><ul>{parsed.error.issues.map((issue, index) => <li key={index}>{issue.message}</li>)}</ul></div>}
    {!ready && <EmptyState title="ยังไม่พร้อมแสดงข้อมูลห้อง" description="ข้อมูลห้องประชุมยังไม่พร้อมใช้งาน กรุณาลองใหม่ภายหลัง" />}
    {result && <><div className="results-heading"><p>พบ <strong>{result.total}</strong> ห้อง{filters.date && " ตามช่วงเวลาที่เลือก"}</p><span className="muted">แสดงเฉพาะห้องที่เปิดใช้งาน</span></div>
      {result.rooms.length ? <div className="room-grid">{result.rooms.map(room => <RoomCard key={room.id} room={room} available={Boolean(filters.date)} />)}</div> : <EmptyState title={result.total ? "ไม่มีห้องในหน้านี้" : "ไม่พบห้องตามเงื่อนไข"} description="ลองเปลี่ยนช่วงเวลา ลดจำนวนผู้เข้าร่วม หรือเลือกอุปกรณ์น้อยลง" href="/rooms" label="ดูห้องทั้งหมด" />}
      {(page > 1 || result.total > page * ROOM_PAGE_SIZE) && <nav className="pagination" aria-label="หน้าผลการค้นหา">{page > 1 && <Link className="button secondary" href={roomSearchUrl(filters, page - 1)}>หน้าก่อนหน้า</Link>}<span>หน้า {page} จาก {Math.max(1, Math.ceil(result.total / ROOM_PAGE_SIZE))}</span>{result.total > page * ROOM_PAGE_SIZE && <Link className="button secondary" href={roomSearchUrl(filters, page + 1)}>หน้าถัดไป</Link>}</nav>}
      <p className="field-hint">ห้องว่างอาจเปลี่ยนได้ ระบบตรวจสอบอีกครั้งเมื่อส่งคำขอจอง</p>
    </>}
  </>;
}
