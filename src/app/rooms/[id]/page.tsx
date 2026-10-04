// Server Component using SSR on purpose: the schedule for ?date= changes whenever anyone books,
// so it must never be served from a static or ISR cache. The query omits user identity and notes.

import Link from "next/link";
import { notFound } from "next/navigation";
import { EmptyState, PageHeading } from "@/components/ui";
import { RoomImage } from "@/components/room-image";
import { getRoom, getRoomSchedule } from "@/lib/rooms";
import { bangkokDate, dayWindow, formatThaiDate, formatThaiTime, type SearchParams } from "@/lib/room-filters";

export const dynamic = "force-dynamic";

export default async function RoomPage({ params, searchParams }: { params: Promise<{ id: string }>; searchParams: Promise<SearchParams> }) {
  const { id } = await params;
  if (!process.env.DATABASE_URL) return <EmptyState title="ยังไม่พร้อมแสดงข้อมูลห้อง" description="ข้อมูลห้องประชุมยังไม่พร้อมใช้งาน กรุณาลองใหม่ภายหลัง" href="/rooms" label="กลับไปค้นหาห้อง" />;
  const room = await getRoom(id);
  if (!room) notFound();
  const query = await searchParams;
  const selected = typeof query.date === "string" ? query.date : bangkokDate();
  const window = dayWindow(selected);
  const bookings = window ? await getRoomSchedule(id, window.start, window.end) : [];
  return <>
    <Link className="text-link back-link" href="/rooms">กลับไปค้นหาห้อง</Link>
    <PageHeading eyebrow={room.location} title={room.name} description={`รองรับผู้เข้าร่วม ${room.capacity} คน`}><span className={`badge${room.isActive ? "" : " inactive"}`}>{room.isActive ? "เปิดใช้งาน" : "ปิดใช้งาน"}</span></PageHeading>
    <div className="room-detail-grid"><RoomImage src={room.imageUrl} name={room.name} priority /><aside className="panel booking-summary"><h2>ห้องสำหรับทีมของคุณ</h2><dl><div><dt>สถานที่</dt><dd>{room.location}</dd></div><div><dt>ความจุ</dt><dd>{room.capacity} คน</dd></div></dl><h3>อุปกรณ์ในห้อง</h3>
      {room.equipment.length ? <ul className="equipment-tags">{room.equipment.map(({ equipment }) => <li key={equipment.id}>{equipment.name}</li>)}</ul> : <p className="muted">ยังไม่มีรายการอุปกรณ์</p>}
      {room.isActive ? <Link className="button" href={`/rooms/${id}/book`}>จองห้องนี้</Link> : <p className="notice">ห้องนี้ปิดใช้งาน ไม่สามารถส่งคำขอจองใหม่ได้</p>}
      <p className="field-hint">ต้องเข้าสู่ระบบก่อนจอง · คำขอรอผู้ดูแลอนุมัติ</p></aside></div>
    <section className="panel schedule" aria-labelledby="schedule-title"><div className="schedule-heading"><div><h2 id="schedule-title">ตารางการใช้ห้อง</h2><p className="muted">เวลาประเทศไทย (UTC+7) · แสดงรายการรออนุมัติและอนุมัติแล้ว</p></div><form method="get"><label htmlFor="schedule-date">เลือกวันที่</label><div className="button-row"><input type="date" name="date" id="schedule-date" defaultValue={selected} required /><button className="button secondary">ดูตาราง</button></div></form></div>
      {!window ? <p className="notice error" role="alert">วันที่ไม่ถูกต้อง กรุณาเลือกวันที่ใหม่</p> : <><h3>{formatThaiDate(window.start)}</h3>{bookings.length ? <ul className="schedule-list">{bookings.map(booking => <li key={booking.id}><span className="schedule-time">{formatThaiTime(booking.startTime)} – {formatThaiTime(booking.endTime)}{(booking.startTime < window.start || booking.endTime > window.end) && <small>รายการต่อเนื่องข้ามวัน</small>}</span><span>มีการจอง</span><span className={`badge${booking.status === "PENDING" ? " pending" : ""}`}>{booking.status === "PENDING" ? "รออนุมัติ" : "อนุมัติแล้ว"}</span></li>)}</ul> : <EmptyState title="ยังไม่มีการจองในวันนี้" description="เลือกช่วงเวลาที่เหมาะกับทีม แล้วส่งคำขอจองห้องได้เลย" />}</>}
      <p className="field-hint">รายการรออนุมัติจะกันช่วงเวลาไว้ด้วย · ไม่แสดงข้อมูลส่วนตัวของผู้จอง</p>
    </section>
  </>;
}
