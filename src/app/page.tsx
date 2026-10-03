import Link from "next/link";

const routes = [
  { href: "/register", label: "สมัครสมาชิก" },
  { href: "/login", label: "เข้าสู่ระบบ" },
  { href: "/profile", label: "โปรไฟล์" },
  { href: "/rooms", label: "ห้องประชุม" },
  { href: "/calendar", label: "ปฏิทิน" },
  { href: "/my-bookings", label: "การจองของฉัน" },
  { href: "/admin/bookings", label: "จัดการคำขอจอง (Optional)" },
  { href: "/admin/rooms", label: "จัดการห้อง (Optional)" },
  { href: "/admin/users", label: "จัดการผู้ใช้ (Optional)" },
  { href: "/admin/reports", label: "รายงาน (Optional)" },
];

export default function HomePage() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">ระบบจองห้องประชุมออนไลน์</h1>
      <p>Basecode สำหรับแบ่งงาน ยังไม่ได้พัฒนาฟีเจอร์</p>
      <ul className="space-y-2">
        {routes.map(({ href, label }) => (
          <li key={href}><Link className="underline" href={href}>{label}</Link></li>
        ))}
      </ul>
    </div>
  );
}
