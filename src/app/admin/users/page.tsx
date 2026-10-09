// Server Component: requireAdmin() runs on the server before any user data is read, so the list
// never reaches a non-admin. Only the role selector is a Client Component.

import Link from "next/link";
import { EmptyState, PageHeading } from "@/components/ui";
import { UserRoleControl } from "@/components/user-role-control";
import { requireAdmin } from "@/lib/auth/guards";
import { getPrisma } from "@/lib/prisma";
import type { SearchParams } from "@/lib/room-filters";

export const dynamic = "force-dynamic";

const PAGE_SIZE = 20;
const one = (value: string | string[] | undefined) => (Array.isArray(value) ? value[0] : value) ?? "";
const dateFormat = new Intl.DateTimeFormat("th-TH", { timeZone: "Asia/Bangkok", dateStyle: "medium" });

export default async function AdminUsersPage({ searchParams }: { searchParams: Promise<SearchParams> }) {
  const admin = await requireAdmin("/admin/users");
  const params = await searchParams;
  const q = one(params.q).trim().slice(0, 100);
  const roleParam = one(params.role);
  const role: "USER" | "ADMIN" | undefined = roleParam === "USER" || roleParam === "ADMIN" ? roleParam : undefined;
  const pageText = one(params.page);
  const page = /^\d+$/.test(pageText) ? Math.min(100000, Math.max(1, Number(pageText))) : 1;

  const where = {
    ...(role ? { role } : {}),
    ...(q ? { OR: [{ name: { contains: q, mode: "insensitive" as const } }, { email: { contains: q, mode: "insensitive" as const } }, { department: { contains: q, mode: "insensitive" as const } }] } : {}),
  };
  const prisma = getPrisma();
  const [users, total, adminCount] = await Promise.all([
    prisma.user.findMany({
      where,
      select: { id: true, name: true, email: true, department: true, role: true, createdAt: true, _count: { select: { bookings: true } } },
      orderBy: [{ role: "asc" }, { name: "asc" }, { id: "asc" }],
      take: PAGE_SIZE,
      skip: (page - 1) * PAGE_SIZE,
    }),
    prisma.user.count({ where }),
    prisma.user.count({ where: { role: "ADMIN" } }),
  ]);
  const pageUrl = (next: number) => `/admin/users?${new URLSearchParams({ q, ...(role ? { role } : {}), page: String(next) })}`;

  return <>
    <PageHeading eyebrow="สำหรับผู้ดูแลระบบ" title="จัดการผู้ใช้" description="ดูรายชื่อผู้ใช้และกำหนดสิทธิ์ผู้ใช้งาน (USER) หรือผู้ดูแลระบบ (ADMIN)" />
    <form className="admin-search" method="get">
      <label htmlFor="admin-user-q">ค้นหาชื่อ อีเมล หรือหน่วยงาน</label>
      <div className="button-row">
        <input id="admin-user-q" name="q" defaultValue={q} maxLength={100} />
        <select name="role" defaultValue={role ?? ""} aria-label="กรองตามสิทธิ์" className="admin-role-filter">
          <option value="">ทุกสิทธิ์</option><option value="USER">USER</option><option value="ADMIN">ADMIN</option>
        </select>
        <button className="button secondary">ค้นหา</button>
        <Link className="text-link" href="/admin/users">ล้างตัวกรอง</Link>
      </div>
    </form>
    <div className="results-heading"><p>ทั้งหมด <strong>{total}</strong> บัญชี · ผู้ดูแลระบบ {adminCount} บัญชี</p></div>
    {users.length ? <div className="admin-table-wrap"><table className="admin-table">
      <caption className="sr-only">รายชื่อผู้ใช้และสิทธิ์</caption>
      <thead><tr><th scope="col">ผู้ใช้</th><th scope="col">หน่วยงาน</th><th scope="col">สมัครเมื่อ</th><th scope="col">การจอง</th><th scope="col">สิทธิ์</th></tr></thead>
      <tbody>{users.map(user => <tr key={user.id}>
        <th scope="row"><strong>{user.name}</strong><br /><span className="muted">{user.email}</span></th>
        <td>{user.department ?? "—"}</td>
        <td>{dateFormat.format(user.createdAt)}</td>
        <td>{user._count.bookings}</td>
        <td><UserRoleControl userId={user.id} name={user.name} role={user.role} isSelf={user.id === admin.id} /></td>
      </tr>)}</tbody>
    </table></div> : <EmptyState title="ไม่พบผู้ใช้" description="ลองเปลี่ยนคำค้นหาหรือตัวกรองสิทธิ์" href="/admin/users" label="ล้างตัวกรอง" />}
    {(page > 1 || total > page * PAGE_SIZE) && <nav className="pagination" aria-label="หน้ารายชื่อผู้ใช้">{page > 1 && <Link className="button secondary" href={pageUrl(page - 1)}>หน้าก่อนหน้า</Link>}<span>หน้า {page}</span>{total > page * PAGE_SIZE && <Link className="button secondary" href={pageUrl(page + 1)}>หน้าถัดไป</Link>}</nav>}
  </>;
}
