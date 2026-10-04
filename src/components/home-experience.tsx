"use client";

import { useRef, useState } from "react";
import Link from "next/link";
import { ArrowDown, ArrowRight, ArrowUpRight, CalendarDays, Check, ChevronLeft, ChevronRight, Clock3, Monitor, Search, Users, Wifi } from "lucide-react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(useGSAP, ScrollTrigger);

const spaces = [
  { title: "คิดด้วยกัน", english: "THE TEAM SESSION", description: "พื้นที่สำหรับระดมไอเดีย วางแผนโปรเจกต์ และต่อยอดความคิดของทีม", capacity: 6, image: "https://images.unsplash.com/photo-1497366754035-f200968a6e72?auto=format&fit=crop&w=1200&q=85" },
  { title: "นำเสนอให้เต็มที่", english: "THE BIG PRESENTATION", description: "เลือกห้องพร้อมจอและอุปกรณ์ ให้ทุกไอเดียสื่อสารได้ชัดเจน", capacity: 12, image: "https://images.unsplash.com/photo-1517502884422-41eaead166d4?auto=format&fit=crop&w=1200&q=85" },
  { title: "เชื่อมทุกการสนทนา", english: "THE HYBRID MEETING", description: "ค้นหาอุปกรณ์ประชุมออนไลน์ เพื่อให้ทุกคนมีส่วนร่วมจากทุกที่", capacity: 8, image: "https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=1200&q=85" },
];
const steps = [
  { title: "เลือกพื้นที่ที่ใช่", text: "ค้นหาตามจำนวนคน เวลา และอุปกรณ์ ดูรายละเอียดห้องก่อนเลือก", icon: Search, detail: "ห้องที่เหมาะกับทีม เริ่มจากสิ่งที่ทีมต้องการ" },
  { title: "เลือกเวลาที่ลงตัว", text: "เช็กปฏิทิน ระบุหัวข้อและช่วงเวลา แล้วส่งคำขอจองให้ผู้ดูแลพิจารณา", icon: CalendarDays, detail: "เห็นตารางชัด วางแผนได้ตั้งแต่ก่อนประชุม" },
  { title: "พร้อมสำหรับไอเดียใหม่", text: "ติดตามผลอนุมัติและรายการจองในที่เดียว เตรียมทีมให้พร้อมก่อนเริ่มประชุม", icon: Check, detail: "ทุกคำขอ ทุกสถานะ อยู่ในรายการจองของคุณ" },
];
const scenarios = [
  { title: "จากความคิดเล็ก ๆ\nสู่โปรเจกต์ที่เป็นรูปเป็นร่าง", text: "ทีมโปรเจกต์นักศึกษา", description: "นัดคุย วางแผน แล้วเดินหน้าต่อด้วยกัน", image: spaces[0].image, capacity: 6 },
  { title: "ทุกมุมมองสำคัญ\nเมื่อทุกคนได้คุยกัน", text: "ทีมบุคลากรและอาจารย์", description: "พื้นที่สำหรับตัดสินใจและทำงานร่วมกัน", image: spaces[1].image, capacity: 12 },
  { title: "ให้ไอเดียของคุณ\nไปไกลกว่าหน้าจอ", text: "ทีมประชุมแบบไฮบริด", description: "เชื่อมบทสนทนาของทีม ทั้งในห้องและออนไลน์", image: spaces[2].image, capacity: 8 },
];

export function HomeExperience() {
  const scope = useRef<HTMLDivElement>(null);
  const [activeSpace, setActiveSpace] = useState(0);
  const [scenario, setScenario] = useState(0);
  useGSAP(() => {
    const media = gsap.matchMedia();
    media.add("(prefers-reduced-motion: no-preference)", () => {
      gsap.from(".hero-enter", { y: 28, opacity: 0, stagger: 0.12, duration: 1, ease: "power3.out", clearProps: "all" });
      gsap.utils.toArray<HTMLElement>(".reveal").forEach(element => {
        gsap.from(element, { y: 36, opacity: 0, duration: 0.9, ease: "power3.out", scrollTrigger: { trigger: element, start: "top 92%", once: true }, clearProps: "all" });
      });
      gsap.fromTo(".manifesto-word", { opacity: 0.2 }, { opacity: 1, stagger: 0.15, ease: "none", scrollTrigger: { trigger: ".manifesto", start: "top 82%", end: "bottom 55%", scrub: true } });
      const desktop = gsap.matchMedia();
      desktop.add("(min-width: 1000px)", () => {
        ScrollTrigger.create({ trigger: ".process-heading", start: "top 150px", endTrigger: ".process-list", end: "bottom 550px", pin: true, pinSpacing: false });
      });
      return () => desktop.revert();
    });
    return () => media.revert();
  }, { scope });

  const current = scenarios[scenario];
  return <div ref={scope} className="home-experience">
    <section className="home-hero" aria-labelledby="hero-title">
      <div className="hero-topline hero-enter"><p>พื้นที่ประชุมสำหรับทุกไอเดีย · DII CMU</p><span>GOOD SPACE. GREAT IDEAS.</span></div>
      <div className="hero-composition">
        <h1 id="hero-title" className="hero-enter">ห้องพร้อม คนพร้อม<br /><span>ให้ไอเดียไปได้ไกล</span></h1>
        <div className="hero-intro hero-enter"><p>พื้นที่ที่ใช่ ให้ทีมทำสิ่งดี ๆ ด้วยกัน<br />ค้นหาห้อง เลือกเวลา แล้วเริ่มต้น<br className="desktop-break" /> การประชุมครั้งถัดไปในแบบของคุณ</p><Link href="/rooms" className="button">ค้นหาห้องประชุม <ArrowUpRight size={19} /></Link><Link href="/calendar" className="hero-calendar-link">ดูปฏิทินการใช้ห้อง <ArrowRight size={16} /></Link></div>
      </div>
      <div className="hero-photo hero-enter">
        <img src="https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=2000&q=90" alt="พื้นที่ทำงานสว่างโปร่ง พร้อมโต๊ะสำหรับพูดคุยและทำงานร่วมกัน" width="2000" height="1000" fetchPriority="high" />
        <div className="hero-photo-wash" />
        <div className="hero-photo-word" aria-hidden="true">make<br /><span>room.</span></div>
        <div className="hero-photo-caption"><span>A LITTLE SPACE FOR BIG IDEAS.</span><span>พื้นที่ดี ๆ สำหรับการเริ่มต้นใหม่</span></div>
        <a href="#find-your-space" className="hero-scroll" aria-label="เลื่อนไปค้นหาพื้นที่"><ArrowDown size={23} /></a>
      </div>
      <p className="photo-credit">ภาพประกอบบรรยากาศพื้นที่ประชุม</p>
    </section>

    <div className="idea-marquee" aria-label="พื้นที่สำหรับการทำงานร่วมกัน">
      <div className="marquee-track" aria-hidden="true">{[0, 1].map(copy => <div className="marquee-group" key={copy}><span>meet.</span><i /><span>think.</span><i /><span>create.</span><i /><span>together.</span><i /></div>)}</div>
    </div>

    <section id="find-your-space" className="home-section search-section" aria-labelledby="search-title">
      <div className="section-heading reveal"><div><p className="eyebrow">ให้ทุกการนัดหมายง่ายขึ้น</p><h2 id="search-title">พื้นที่ของทีมคุณ<br /><span className="muted">เริ่มตรงนี้</span></h2></div><p>ไม่ว่าจะคุยงาน ระดมสมอง หรือพรีเซนต์<br />เลือกพื้นที่ให้พอดีกับสิ่งที่คุณกำลังทำ</p></div>
      <div className="search-bento">
        <div className="search-tile reveal"><div className="tile-icon"><Users size={25} /></div><h3>วันนี้ ทีมคุณมีกี่คน?</h3><p>เลือกจำนวนผู้เข้าร่วม เราช่วยค้นหาห้องที่รองรับทีมคุณ</p><form action="/rooms" method="get" className="home-search-form"><div><label htmlFor="home-capacity">จำนวนผู้เข้าร่วม</label><select id="home-capacity" name="capacity" defaultValue=""><option value="">ทุกขนาดทีม</option><option value="4">4 คนขึ้นไป</option><option value="8">8 คนขึ้นไป</option><option value="12">12 คนขึ้นไป</option><option value="20">20 คนขึ้นไป</option></select></div><button className="button" type="submit"><Search size={18} />ค้นหาห้อง</button></form><div className="search-footnote"><Check size={15} />ดูรายละเอียดและอุปกรณ์ก่อนส่งคำขอจอง</div></div>
        <Link href="/calendar" className="calendar-tile reveal"><div className="tile-top"><CalendarDays size={26} /><ArrowUpRight size={25} /></div><div className="mini-calendar" aria-hidden="true">{Array.from({ length: 14 }, (_, index) => <span className={[3, 4, 10].includes(index) ? "marked" : ""} key={index}>{index + 1}</span>)}</div><div><h3>หาช่วงเวลาที่ลงตัว</h3><p>เปิดปฏิทิน ดูตารางห้อง แล้ววางแผนล่วงหน้า</p></div></Link>
      </div>
    </section>

    <section className="home-section spaces-section" aria-labelledby="spaces-title">
      <div className="section-heading reveal"><div><p className="eyebrow">ต่างทีม ต่างไอเดีย พื้นที่เดียวกัน</p><h2 id="spaces-title">มีพื้นที่ให้ทุกจังหวะ<br />ของการทำงาน</h2></div><Link href="/rooms" className="text-link">สำรวจห้องทั้งหมด <ArrowUpRight size={18} /></Link></div>
      <div className="space-accordion reveal">{spaces.map((space, index) => <article key={space.title} className={`space-slice ${activeSpace === index ? "is-active" : ""}`}>
        <img src={space.image} alt={`ภาพประกอบพื้นที่สำหรับ${space.title}`} width="1200" height="1000" loading="lazy" />
        <div className="space-wash" />
        <button type="button" className="space-toggle" onClick={() => setActiveSpace(index)} onFocus={() => setActiveSpace(index)} aria-expanded={activeSpace === index} aria-controls={`space-content-${index}`}><span>{space.english}</span><span className="space-title">{space.title}</span><span className="space-arrow"><ArrowUpRight size={23} /></span></button>
        <div id={`space-content-${index}`} className="space-content" hidden={activeSpace !== index}><p>{space.description}</p><Link href={`/rooms?capacity=${space.capacity}`} className="space-link">ค้นหาห้องสำหรับทีม <ArrowRight size={17} /></Link></div>
      </article>)}</div>
      <div className="spaces-note"><span>ภาพประกอบแนวทางการเลือกพื้นที่</span><span><Monitor size={15} />เลือกอุปกรณ์ได้ในหน้าค้นหา<Wifi size={15} /></span></div>
    </section>

    <section className="manifesto" aria-label="แนวคิดของ MEETSYNC"><p>{["ไอเดียที่ดี", "เริ่มจาก", "พื้นที่", "ที่ให้เรา", "คิดด้วยกัน"].map((word, index) => <span key={word} className={`manifesto-word ${index === 2 || index === 4 ? "blue-word" : ""}`}>{word} </span>)}</p><div className="manifesto-caption"><span>LESS FRICTION. MORE CONNECTION.</span><p>ให้เรื่องห้องเป็นเรื่องง่าย แล้วโฟกัสกับสิ่งที่สำคัญ</p></div></section>

    <section className="home-section process-section" aria-labelledby="process-title"><div className="process-heading"><p className="eyebrow">จากนัดหมาย สู่การประชุม</p><h2 id="process-title">น้อยขั้นตอน<br /><span className="muted">มากความเป็นไปได้</span></h2><p>เตรียมพื้นที่ให้พร้อม<br />ใน 3 ขั้นตอนที่เข้าใจง่าย</p><Link href="/rooms" className="button secondary">เริ่มค้นหาห้อง <ArrowUpRight size={18} /></Link></div><ol className="process-list">{steps.map((step, index) => <li key={step.title} className="process-step reveal"><div className="process-step-top"><span className="process-number">0{index + 1}</span><step.icon size={27} /></div><h3>{step.title}</h3><p>{step.text}</p><div className="process-detail"><span className="small-dot" />{step.detail}</div></li>)}</ol></section>

    <section className="team-story reveal" aria-labelledby="story-title"><div className="story-photo"><img key={current.image} src={current.image} alt={`ภาพประกอบพื้นที่สำหรับ${current.text}`} loading="lazy" width="900" height="1100" /><span>SPACE FOR YOUR NEXT CHAPTER.</span></div><div className="story-copy"><p className="eyebrow">พื้นที่ของคุณ เรื่องราวของทีมคุณ</p><div className="story-content" key={scenario} aria-live="polite"><h2 id="story-title">{current.title}</h2><p className="story-audience">{current.text}</p><p className="muted">{current.description}</p><Link className="text-link" href={`/rooms?capacity=${current.capacity}`}>ค้นหาพื้นที่สำหรับทีม <ArrowUpRight size={18} /></Link></div><div className="story-controls"><span>0{scenario + 1}<span className="muted"> / 03</span></span><div><button type="button" className="icon-button" aria-label="ดูรูปแบบทีมก่อนหน้า" onClick={() => setScenario((scenario + scenarios.length - 1) % scenarios.length)}><ChevronLeft size={20} /></button><button type="button" className="icon-button" aria-label="ดูรูปแบบทีมถัดไป" onClick={() => setScenario((scenario + 1) % scenarios.length)}><ChevronRight size={20} /></button></div></div></div></section>
    <div className="home-endnote"><Clock3 size={16} /><span>สำหรับนักศึกษาและบุคลากร DII CMU · ส่งคำขอจองและติดตามผลในระบบ</span></div>
  </div>;
}
