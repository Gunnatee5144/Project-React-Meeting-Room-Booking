// Server Component: requireRoomViewer() redirects guests on the server and the user data never
// needs a client fetch. Only ProfileForm is a Client Component.

import { PageHeading } from "@/components/ui";
import { ProfileForm } from "@/components/profile-form";
import { requireRoomViewer } from "@/lib/room-access";
import { logoutProfileSession } from "@/actions/profile";

export default async function ProfilePage() {
  const user = await requireRoomViewer("/profile");
  return <><PageHeading eyebrow="บัญชีของคุณ" title="ข้อมูลส่วนตัว" description="อัปเดตชื่อ อีเมล และหน่วยงานที่ใช้ในการจองห้อง" />
    <div className="profile-grid"><section className="panel"><h2>รายละเอียดบัญชี</h2><ProfileForm user={{ name: user.name, email: user.email, department: user.department ?? "" }} /></section>
      <aside className="panel profile-summary"><div className="avatar" aria-hidden="true">{Array.from(user.name)[0]}</div><h2>{user.name}</h2><p className="muted">{user.email}</p><span className="badge">{user.role === "ADMIN" ? "ผู้ดูแลระบบ" : "ผู้ใช้งาน"}</span><p className="field-hint">สิทธิ์บัญชีกำหนดโดยผู้ดูแลระบบ</p><form action={logoutProfileSession}><button className="button secondary">ออกจากระบบ</button></form></aside>
    </div></>;
}
