import Link from "next/link";
import { RoomPlan } from "@/components/ui";

export default function HomePage() {
  return <div className="home">
    <section className="hero">
      <div className="hero-copy"><p className="eyebrow">พื้นที่ดี ๆ สำหรับความคิดใหม่</p>
        <h1>ห้องพร้อม คนพร้อม<br />เริ่มประชุมได้เลย</h1>
        <p>ค้นหาห้องที่เหมาะกับทีม เลือกเวลาที่ต้องการ แล้วติดตามคำขอจองได้ในที่เดียว</p>
        <div className="button-row"><Link className="button" href="/rooms">ค้นหาห้องประชุม <span aria-hidden="true">↗</span></Link><Link className="button secondary" href="/calendar">ดูปฏิทินการใช้ห้อง</Link></div>
        <p className="hero-note">สำหรับนักศึกษาและบุคลากร · จองล่วงหน้าได้ 30 วัน</p>
      </div>
      <div className="hero-plan"><div className="plan-caption"><span>ROOM TO THINK</span><span>ผังห้องประชุม</span></div><RoomPlan /><p>เลือกพื้นที่ให้พอดีกับทีมของคุณ</p></div>
    </section>
    <section className="quick-search" aria-labelledby="quick-search-title">
      <div><p className="eyebrow">เริ่มต้นค้นหา</p><h2 id="quick-search-title">ทีมของคุณมีกี่คน?</h2></div>
      <form action="/rooms" method="get" className="quick-search-form"><label htmlFor="home-capacity">จำนวนผู้เข้าร่วม</label><input id="home-capacity" name="capacity" type="number" min="1" max="10000" placeholder="เช่น 8" /><button className="button" type="submit">ค้นหาห้อง</button></form>
    </section>
    <section className="how-it-works" aria-labelledby="how-title"><div className="section-title"><p className="eyebrow">จากไอเดีย สู่การประชุม</p><h2 id="how-title">เตรียมห้องให้พร้อมใน 3 ขั้นตอน</h2></div>
      <ol className="steps"><li><span className="step-number">1</span><h3>เลือกห้องที่ใช่</h3><p>ค้นหาตามวัน เวลา จำนวนคน และอุปกรณ์ ดูรายละเอียดก่อนตัดสินใจ</p></li><li><span className="step-number">2</span><h3>ส่งคำขอจอง</h3><p>เข้าสู่ระบบ ระบุหัวข้อประชุมและช่วงเวลา แล้วส่งคำขอให้ผู้ดูแลพิจารณา</p></li><li><span className="step-number">3</span><h3>ติดตามสถานะ</h3><p>ดูผลในรายการจองของฉัน แก้ไขหรือยกเลิกตามเงื่อนไขก่อนเริ่มประชุม</p></li></ol>
    </section>
    <section className="home-callout"><div><h2>มีบัญชีแล้ว? ดูการจองของคุณ</h2><p>ทุกคำขอและประวัติการใช้ห้อง อยู่ในที่เดียว</p></div><Link className="button secondary" href="/my-bookings">การจองของฉัน</Link></section>
  </div>;
}
