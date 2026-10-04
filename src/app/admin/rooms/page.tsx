import Link from "next/link";
import { EmptyState, PageHeading } from "@/components/ui";
import { RoomForm } from "@/components/room-form";
import { DeleteRoomButton } from "@/components/delete-room-button";
import { EquipmentManager } from "@/components/equipment-manager";
import { requireRoomAdmin } from "@/lib/room-access";
import { getPrisma } from "@/lib/prisma";
import { listEquipment, roomSelect } from "@/lib/rooms";
import type { SearchParams } from "@/lib/room-filters";

export default async function AdminRoomsPage({ searchParams }: { searchParams: Promise<SearchParams> }) {
  const admin = await requireRoomAdmin();
  if (!admin) return <EmptyState title="เฉพาะผู้ดูแลระบบ" description="บัญชีของคุณไม่มีสิทธิ์จัดการห้องประชุม" href="/rooms" label="ค้นหาห้องประชุม" />;
  const params = await searchParams;
  const q = typeof params.q === "string" ? params.q.trim().slice(0, 100) : "";
  const page = typeof params.page === "string" && /^\d+$/.test(params.page) ? Math.min(100000, Math.max(1, Number(params.page))) : 1;
  const where = q ? { OR: [{ name: { contains: q, mode: "insensitive" as const } }, { location: { contains: q, mode: "insensitive" as const } }] } : {};
  const prisma = getPrisma();
  const [rooms, total, equipment] = await Promise.all([
    prisma.room.findMany({ where, select: { ...roomSelect, _count: { select: { bookings: true } } }, orderBy: [{ name: "asc" }, { id: "asc" }], take: 20, skip: (page - 1) * 20 }),
    prisma.room.count({ where }), listEquipment(),
  ]);
  const pageUrl = (next: number) => `/admin/rooms?${new URLSearchParams({ q, page: String(next) })}`;
  return <><PageHeading eyebrow="สำหรับผู้ดูแลระบบ" title="จัดการห้องประชุม" description="ดูแลข้อมูลห้อง อุปกรณ์ และสถานะเปิดใช้งาน" />
    <details className="panel add-room"><summary>เพิ่มห้องประชุมใหม่</summary><RoomForm equipment={equipment} /></details>
    <form className="admin-search" method="get"><label htmlFor="admin-room-q">ค้นหาชื่อห้องหรือสถานที่</label><div className="button-row"><input id="admin-room-q" name="q" defaultValue={q} maxLength={100} /><button className="button secondary">ค้นหา</button><Link className="text-link" href="/admin/rooms">ล้างตัวกรอง</Link></div></form>
    <div className="results-heading"><p>ทั้งหมด <strong>{total}</strong> ห้อง</p><span className="muted">ห้องที่มีประวัติการจองจะปิดใช้งานแทนการลบ</span></div>
    <div className="admin-room-list">{rooms.map(room => <article className="panel admin-room" key={room.id}><div className="admin-room-heading"><div><h2><Link className="text-link" href={`/rooms/${room.id}`}>{room.name}</Link></h2><p className="muted">{room.location} · {room.capacity} คน · ประวัติ {room._count.bookings} รายการ</p></div><span className={`badge${room.isActive ? "" : " inactive"}`}>{room.isActive ? "เปิดใช้งาน" : "ปิดใช้งาน"}</span></div>
      <details><summary>แก้ไขข้อมูลห้อง</summary><RoomForm key={JSON.stringify(room)} equipment={equipment} room={{ id: room.id, name: room.name, location: room.location, capacity: room.capacity, imageUrl: room.imageUrl ?? "", isActive: room.isActive, equipmentIds: room.equipment.map(item => item.equipment.id) }} /></details>
      <DeleteRoomButton id={room.id} name={room.name} hasHistory={room._count.bookings > 0} />
    </article>)}</div>
    {!rooms.length && <EmptyState title="ยังไม่มีห้องในรายการนี้" description="เพิ่มห้องใหม่ หรือเปลี่ยนคำค้นหาเพื่อดูห้องที่มีอยู่" />}
    {(page > 1 || total > page * 20) && <nav className="pagination" aria-label="หน้ารายการห้อง">{page > 1 && <Link className="button secondary" href={pageUrl(page - 1)}>หน้าก่อนหน้า</Link>}<span>หน้า {page}</span>{total > page * 20 && <Link className="button secondary" href={pageUrl(page + 1)}>หน้าถัดไป</Link>}</nav>}
    <EquipmentManager equipment={equipment} />
  </>;
}
