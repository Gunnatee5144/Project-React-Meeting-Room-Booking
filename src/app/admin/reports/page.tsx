// Server Component: requireAdmin() runs on the server, then the report is computed from the
// database on every request (no cache) so numbers match the latest approvals. No client JS needed:
// the date range is a plain GET form, which keeps the range in the URL.

import Link from "next/link";
import { EmptyState, PageHeading } from "@/components/ui";
import { requireAdmin } from "@/lib/auth/guards";
import { getPrisma } from "@/lib/prisma";
import { CLOSE_HOUR, OPEN_HOUR, buildReport, formatReportDate, parseReportDate, resolveReportRange } from "@/lib/reports";
import type { SearchParams } from "@/lib/room-filters";

export const dynamic = "force-dynamic";

const one = (value: string | string[] | undefined) => (Array.isArray(value) ? value[0] : value) ?? "";
const percent = new Intl.NumberFormat("th-TH", { style: "percent", maximumFractionDigits: 1 });
const number = new Intl.NumberFormat("th-TH", { maximumFractionDigits: 1 });
const DAY_MS = 24 * 60 * 60 * 1000;

export default async function AdminReportsPage({ searchParams }: { searchParams: Promise<SearchParams> }) {
  await requireAdmin("/admin/reports");
  const params = await searchParams;
  const range = resolveReportRange(one(params.from) || undefined, one(params.to) || undefined);
  const fromText = formatReportDate(range.from);
  const toText = formatReportDate(new Date(range.toExclusive.getTime() - DAY_MS));

  const prisma = getPrisma();
  const [rooms, bookings] = await Promise.all([
    prisma.room.findMany({ select: { id: true, name: true, isActive: true } }),
    prisma.booking.findMany({
      where: { startTime: { lt: range.toExclusive }, endTime: { gt: range.from } },
      select: { roomId: true, startTime: true, endTime: true, status: true, attendeeCount: true },
    }),
  ]);
  const report = buildReport(rooms, bookings, range.from, range.toExclusive);

  const today = formatReportDate(new Date());
  const todayStart = (parseReportDate(today) as Date).getTime();
  const daysAgo = (count: number) => formatReportDate(new Date(todayStart - count * DAY_MS));
  const preset = (label: string, count: number) => <Link className="text-link" key={count} href={`/admin/reports?from=${daysAgo(count - 1)}&to=${today}`}>{label}</Link>;

  // Show the opening-hours window, widened if approved bookings fall outside it.
  const used = report.hourlyHours.map((hours, hour) => (hours > 0 ? hour : -1)).filter(hour => hour >= 0);
  const firstHour = Math.min(OPEN_HOUR, ...used);
  const lastHour = Math.max(CLOSE_HOUR - 1, ...used);
  const hours = Array.from({ length: lastHour - firstHour + 1 }, (_, index) => firstHour + index);
  const maxHourly = Math.max(0.0001, ...report.hourlyHours);
  const topRooms = report.rooms.filter(room => room.approvedCount > 0).slice(0, 5);
  const maxCount = Math.max(1, ...topRooms.map(room => room.approvedCount));
  const pad = (hour: number) => String(hour).padStart(2, "0");

  return <>
    <PageHeading eyebrow="สำหรับผู้ดูแลระบบ" title="รายงานการใช้ห้อง" description="อัตราการใช้ห้อง ห้องที่ถูกจองมากที่สุด และช่วงเวลายอดนิยม คำนวณจากรายการที่อนุมัติแล้ว" />
    {range.error && <div className="notice error" role="alert">{range.error}</div>}
    <form className="admin-search report-range" method="get">
      <div className="button-row">
        <div className="field"><label htmlFor="report-from">ตั้งแต่วันที่</label><input id="report-from" type="date" name="from" defaultValue={fromText} required /></div>
        <div className="field"><label htmlFor="report-to">ถึงวันที่</label><input id="report-to" type="date" name="to" defaultValue={toText} required /></div>
        <button className="button secondary">ดูรายงาน</button>
      </div>
      <div className="button-row">{preset("7 วันล่าสุด", 7)}{preset("30 วันล่าสุด", 30)}{preset("90 วันล่าสุด", 90)}</div>
    </form>
    <p className="muted">ช่วง {fromText} ถึง {toText} ({report.days} วัน) · เวลาประเทศไทย · อัตราการใช้ห้องคิดจากชั่วโมงที่อนุมัติระหว่าง {pad(OPEN_HOUR)}:00–{pad(CLOSE_HOUR)}:00 เทียบกับชั่วโมงทั้งหมดของแต่ละห้อง</p>

    <div className="report-stats">
      <div className="panel"><p className="muted">คำขอจองทั้งหมด</p><strong className="report-number">{report.totalBookings}</strong></div>
      <div className="panel"><p className="muted">อนุมัติแล้ว</p><strong className="report-number">{report.statusCounts.APPROVED}</strong><p className="field-hint">{number.format(report.approvedHours)} ชั่วโมง</p></div>
      <div className="panel"><p className="muted">รอตรวจสอบ</p><strong className="report-number">{report.statusCounts.PENDING}</strong></div>
      <div className="panel"><p className="muted">ไม่อนุมัติ / ยกเลิก</p><strong className="report-number">{report.statusCounts.REJECTED} / {report.statusCounts.CANCELLED}</strong></div>
      <div className="panel"><p className="muted">อัตราการใช้ห้องรวม</p><strong className="report-number">{percent.format(report.overallUtilization)}</strong></div>
    </div>

    {!report.totalBookings && <EmptyState title="ไม่มีการจองในช่วงเวลานี้" description="ลองเลือกช่วงวันที่ที่กว้างขึ้น" />}

    {report.totalBookings > 0 && <div className="report-grid">
      <section className="panel" aria-labelledby="top-rooms"><h2 id="top-rooms">ห้องที่ถูกจองมากที่สุด</h2>
        {topRooms.length ? <ol className="report-bars">{topRooms.map(room => <li key={room.roomId}><div className="report-bar-label"><span>{room.name}</span><span>{room.approvedCount} ครั้ง</span></div><div className="report-bar" role="img" aria-label={`${room.name} ${room.approvedCount} ครั้ง`}><span style={{ width: `${(room.approvedCount / maxCount) * 100}%` }} /></div></li>)}</ol> : <p className="muted">ยังไม่มีรายการที่อนุมัติในช่วงนี้</p>}
      </section>
      <section className="panel" aria-labelledby="peak-hours"><h2 id="peak-hours">ช่วงเวลายอดนิยม</h2>
        <p className="field-hint">ชั่วโมงที่ได้รับอนุมัติรวมในแต่ละชั่วโมงของวัน</p>
        <ol className="report-bars">{hours.map(hour => <li key={hour}><div className="report-bar-label"><span>{pad(hour)}:00–{pad(hour + 1)}:00</span><span>{number.format(report.hourlyHours[hour])} ชม.</span></div><div className="report-bar" role="img" aria-label={`${pad(hour)}:00 ${number.format(report.hourlyHours[hour])} ชั่วโมง`}><span style={{ width: `${(report.hourlyHours[hour] / maxHourly) * 100}%` }} /></div></li>)}</ol>
      </section>
    </div>}

    {report.rooms.length > 0 && <section className="panel" aria-labelledby="utilization"><h2 id="utilization">อัตราการใช้ห้องรายห้อง</h2>
      <div className="admin-table-wrap"><table className="admin-table">
        <thead><tr><th scope="col">ห้อง</th><th scope="col">อนุมัติ (ครั้ง)</th><th scope="col">ชั่วโมงที่ใช้</th><th scope="col">อัตราการใช้</th></tr></thead>
        <tbody>{report.rooms.map(room => <tr key={room.roomId}><th scope="row">{room.name}</th><td>{room.approvedCount}</td><td>{number.format(room.bookedHours)} / {number.format(report.availableHoursPerRoom)}</td><td>{percent.format(room.utilization)}</td></tr>)}</tbody>
      </table></div>
    </section>}
  </>;
}
