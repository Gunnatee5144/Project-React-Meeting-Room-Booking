"use client";

import { useRouter } from "next/navigation";
import { useTransition } from "react";
import Link from "next/link";
import { roomSearchUrl, type RoomFilters } from "@/lib/room-filters";

export function RoomFilterForm({ filters, equipment }: { filters: RoomFilters; equipment: { id: string; name: string }[] }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  return <form className="panel room-filter-form" action="/rooms" method="get" onSubmit={event => {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const next: RoomFilters = { q: String(data.get("q") ?? ""), capacity: String(data.get("capacity") ?? ""), date: String(data.get("date") ?? ""), start: String(data.get("start") ?? ""), end: String(data.get("end") ?? ""), equipment: data.getAll("equipment").map(String), page: "1" };
    startTransition(() => router.push(roomSearchUrl(next, 1)));
  }}>
    <div className="filter-grid">
      <div className="field search-field"><label htmlFor="q">ชื่อห้องหรือสถานที่</label><input key={`q-${filters.q}`} id="q" name="q" defaultValue={filters.q} maxLength={100} placeholder="ค้นหาชื่อห้อง อาคาร หรือชั้น" /></div>
      <div className="field"><label htmlFor="capacity">จำนวนผู้เข้าร่วม</label><input key={`capacity-${filters.capacity}`} id="capacity" name="capacity" type="number" min="1" max="10000" defaultValue={filters.capacity} placeholder="ไม่จำกัด" /></div>
      <div className="field"><label htmlFor="date">วันที่</label><input key={`date-${filters.date}`} id="date" name="date" type="date" defaultValue={filters.date} /></div>
      <div className="field"><label htmlFor="start">เวลาเริ่ม</label><input key={`start-${filters.start}`} id="start" name="start" type="time" defaultValue={filters.start} /></div>
      <div className="field"><label htmlFor="end">เวลาสิ้นสุด</label><input key={`end-${filters.end}`} id="end" name="end" type="time" defaultValue={filters.end} /></div>
    </div>
    <p className="field-hint">ค้นหาห้องว่าง: ระบุวันที่ เวลาเริ่ม และเวลาสิ้นสุดให้ครบ · เวลาประเทศไทย (UTC+7)</p>
    {equipment.length > 0 && <fieldset><legend>อุปกรณ์ที่ต้องการ</legend><div className="equipment-options">{equipment.map(item => <label className="checkbox-label" key={`${item.id}-${filters.equipment.includes(item.id)}`}><input type="checkbox" name="equipment" value={item.id} defaultChecked={filters.equipment.includes(item.id)} />{item.name}</label>)}</div></fieldset>}
    <div className="button-row"><button className="button" disabled={pending}>{pending ? "กำลังค้นหา…" : "ค้นหาห้อง"}</button><Link className="text-link" href="/rooms">ล้างตัวกรอง</Link></div>
  </form>;
}
