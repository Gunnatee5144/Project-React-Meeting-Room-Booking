import { EmptyState } from "@/components/ui";
export default function RoomNotFound() {
  return <EmptyState title="ไม่พบห้องประชุมนี้" description="ห้องอาจถูกลบแล้ว กรุณากลับไปเลือกห้องจากรายการล่าสุด" href="/rooms" label="ค้นหาห้องประชุม" />;
}
