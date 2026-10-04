import Link from "next/link";
import { RoomImage } from "@/components/room-image";

type RoomCardData = {
  id: string; name: string; location: string; capacity: number; imageUrl: string | null;
  equipment: { equipment: { id: string; name: string } }[];
};

export function RoomCard({ room, available }: { room: RoomCardData; available: boolean }) {
  return <article className="room-card"><RoomImage src={room.imageUrl} name={room.name} />
    <div className="room-card-content"><div className="room-card-title"><h2><Link href={`/rooms/${room.id}`}>{room.name}</Link></h2>{available && <span className="badge">ว่างตามเวลาที่ค้นหา</span>}</div>
      <p className="muted">{room.location}</p><p className="room-capacity">รองรับ {room.capacity} คน</p>
      <ul className="equipment-tags" aria-label="อุปกรณ์ในห้อง">{room.equipment.slice(0, 4).map(({ equipment }) => <li key={equipment.id}>{equipment.name}</li>)}{room.equipment.length > 4 && <li>อีก {room.equipment.length - 4} รายการ</li>}</ul>
      <Link href={`/rooms/${room.id}`} className="text-link room-card-link">ดูรายละเอียดห้อง <span aria-hidden="true">↗</span></Link>
    </div></article>;
}
