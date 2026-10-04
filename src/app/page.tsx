"use client";

import { useRef, useState, type FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowRight,
  ArrowUpRight,
  Calendar,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Clock,
  Monitor,
  Search,
  SlidersHorizontal,
  Users,
  Video,
  Wifi,
} from "lucide-react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import { useApp } from "@/context/app-context";
import { CodeBadge, StatusBadge } from "@/components/ui/badge";
import { Dialog } from "@/components/ui/dialog";
import type { RoomItem } from "@/lib/mock-data";

gsap.registerPlugin(ScrollTrigger, useGSAP);

function dateKey(date = new Date()) {
  const parts = new Intl.DateTimeFormat("en-GB", {
    timeZone: "Asia/Bangkok",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(date);
  const values = Object.fromEntries(
    parts.map((part) => [part.type, part.value]),
  );
  return values.year + "-" + values.month + "-" + values.day;
}
const equipmentHighlights = [
  { label: "Video Conference", icon: Video },
  { label: "Interactive Display", icon: Monitor },
  { label: "High-speed Wi-Fi", icon: Wifi },
  { label: "Wireless Presentation", icon: SlidersHorizontal },
  { label: "Smart Whiteboard", icon: Monitor },
];

export default function HomePage() {
  const router = useRouter();
  const { rooms, bookings } = useApp();
  const page = useRef<HTMLDivElement>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [capacity, setCapacity] = useState("");
  const [equipment, setEquipment] = useState("");
  const [featuredIndex, setFeaturedIndex] = useState(0);
  const [openSpace, setOpenSpace] = useState(0);
  const [previewRoom, setPreviewRoom] = useState<RoomItem | null>(null);
  const [previewDate, setPreviewDate] = useState(dateKey);
  const featuredRoom = rooms[featuredIndex] || rooms[0];
  const spaceTypes = [
    {
      title: "ประชุมอย่างเป็นส่วนตัว",
      description: "พื้นที่เงียบสำหรับคุยงาน วางแผน และตัดสินใจร่วมกัน",
      room: rooms.find((room) => room.name.includes("Boardroom")),
      href: "/rooms?q=Boardroom",
    },
    {
      title: "ปล่อยไอเดียให้เต็มที่",
      description: "พื้นที่ยืดหยุ่นสำหรับเวิร์กช็อปและการระดมความคิด",
      room: rooms.find((room) => room.name.includes("Agile")),
      href: "/rooms?q=Agile",
    },
    {
      title: "เรียนรู้ไปด้วยกัน",
      description: "ห้องสัมมนาสำหรับแชร์ความรู้และกิจกรรมของทีม",
      room: rooms.find((room) => room.capacity >= 50),
      href: "/rooms?capacity=50",
    },
  ].filter((space) => space.room);
  const previewBookings = previewRoom
    ? bookings
        .filter(
          (booking) =>
            booking.roomId === previewRoom.id &&
            booking.status === "APPROVED" &&
            dateKey(new Date(booking.startTime)) === previewDate,
        )
        .sort((a, b) => Date.parse(a.startTime) - Date.parse(b.startTime))
    : [];

  useGSAP(
    () => {
      const media = gsap.matchMedia();
      media.add("(prefers-reduced-motion: no-preference)", () => {
        gsap.from(".hero-reveal", {
          opacity: 0,
          y: 28,
          duration: 0.9,
          stagger: 0.1,
          ease: "power3.out",
        });
        gsap.fromTo(
          ".scroll-story span",
          { opacity: 0.25 },
          {
            opacity: 1,
            stagger: 0.15,
            ease: "none",
            scrollTrigger: {
              trigger: ".scroll-story",
              start: "top 80%",
              end: "top 35%",
              scrub: 1,
            },
          },
        );
        gsap.utils
          .toArray<HTMLElement>("[data-home-reveal]")
          .forEach((element) => {
            gsap.from(element, {
              opacity: 0,
              y: 30,
              duration: 0.75,
              ease: "power2.out",
              scrollTrigger: { trigger: element, start: "top 92%", once: true },
            });
          });
      });
      media.add(
        "(min-width: 1024px) and (min-height: 550px) and (prefers-reduced-motion: no-preference)",
        () => {
          const intro =
            page.current?.querySelector<HTMLElement>(".directory-intro");
          if (!intro || intro.offsetHeight + 145 > window.innerHeight) return;
          ScrollTrigger.create({
            trigger: intro,
            start: "top 120px",
            endTrigger: ".directory-layout",
            end: "bottom bottom",
            pin: intro,
            pinSpacing: false,
            invalidateOnRefresh: true,
          });
        },
      );
      return () => media.revert();
    },
    { scope: page, dependencies: [rooms.length], revertOnUpdate: true },
  );

  const handleSearch = (event: FormEvent) => {
    event.preventDefault();
    const params = new URLSearchParams();
    if (searchQuery.trim()) params.set("q", searchQuery.trim());
    if (capacity) params.set("capacity", capacity);
    if (equipment) params.append("equipment", equipment);
    router.push("/rooms" + (params.size ? "?" + params.toString() : ""));
  };

  return (
    <div ref={page} className="home-page">
      <section className="home-hero">
        <div className="hero-wash" aria-hidden="true" />
        <div className="hero-grid">
          <div className="hero-copy">
            <p className="hero-kicker hero-reveal">
              พื้นที่ประชุม DII · มหาวิทยาลัยเชียงใหม่
            </p>
            <h1 className="hero-title hero-reveal max-w-5xl">
              <span>พื้นที่ดี ๆ</span>
              <span className="hero-title-blue">ให้ไอเดียไปไกล</span>
            </h1>
            <p className="hero-description hero-reveal">
              เลือกห้องที่เหมาะกับทีม เช็กอุปกรณ์และช่วงเวลาว่าง
              <br className="hidden xl:block" /> แล้วส่งคำขอจองได้ในที่เดียว
            </p>
            <div className="hero-actions hero-reveal">
              <Link href="/rooms" className="button-primary">
                ค้นหาห้องประชุม{" "}
                <ArrowUpRight className="h-4 w-4" aria-hidden="true" />
              </Link>
              <Link href="/calendar" className="button-secondary">
                <Calendar className="h-4 w-4" aria-hidden="true" />
                ดูตารางห้อง
              </Link>
            </div>
          </div>

          {featuredRoom && (
            <>
              <div className="hero-photo hero-reveal">
                <Link
                  href={"/rooms/" + featuredRoom.id}
                  className="block h-full"
                  aria-label={"ดูรายละเอียด " + featuredRoom.name}
                >
                  <img
                    src={featuredRoom.imageUrl}
                    alt={featuredRoom.name}
                    fetchPriority="high"
                  />
                </Link>
                <div className="hero-photo-shade" aria-hidden="true" />
                <div className="hero-room-controls">
                  <button
                    type="button"
                    className="icon-button"
                    aria-label="ห้องแนะนำก่อนหน้า"
                    onClick={() =>
                      setFeaturedIndex(
                        (index) => (index - 1 + rooms.length) % rooms.length,
                      )
                    }
                  >
                    <ChevronLeft className="h-4 w-4" aria-hidden="true" />
                  </button>
                  <button
                    type="button"
                    className="icon-button"
                    aria-label="ห้องแนะนำถัดไป"
                    onClick={() =>
                      setFeaturedIndex((index) => (index + 1) % rooms.length)
                    }
                  >
                    <ChevronRight className="h-4 w-4" aria-hidden="true" />
                  </button>
                </div>
                <div className="hero-room-info">
                  <span className="text-[11px] tracking-wider text-white/70">
                    {featuredRoom.roomCode}
                  </span>
                  <h2>
                    <Link href={"/rooms/" + featuredRoom.id}>
                      {featuredRoom.name}
                    </Link>
                  </h2>
                  <p>
                    {featuredRoom.building} · รองรับ {featuredRoom.capacity} คน
                  </p>
                </div>
              </div>
              <div className="hero-floating-note hero-reveal">
                <span className="grid h-10 w-10 place-items-center rounded-full bg-blue-50 text-blue-600">
                  <CheckCircle2 className="h-5 w-5" aria-hidden="true" />
                </span>
                <div>
                  <p>วางแผนได้อย่างมั่นใจ</p>
                  <strong>เช็กช่วงว่างก่อนจอง</strong>
                </div>
              </div>
            </>
          )}
        </div>

        <form onSubmit={handleSearch} className="search-ribbon hero-reveal">
          <div className="search-field">
            <label htmlFor="home-room-search">
              <Search className="h-3.5 w-3.5" aria-hidden="true" />
              ค้นหาพื้นที่
            </label>
            <input
              id="home-room-search"
              type="search"
              value={searchQuery}
              onChange={(event) => setSearchQuery(event.target.value)}
              placeholder="ชื่อห้อง รหัสห้อง หรืออาคาร"
            />
          </div>
          <div className="search-field">
            <label htmlFor="home-capacity">
              <Users className="h-3.5 w-3.5" aria-hidden="true" />
              จำนวนผู้เข้าร่วม
            </label>
            <select
              id="home-capacity"
              value={capacity}
              onChange={(event) => setCapacity(event.target.value)}
            >
              <option value="">ทุกขนาดห้อง</option>
              <option value="6">อย่างน้อย 6 คน</option>
              <option value="15">อย่างน้อย 15 คน</option>
              <option value="50">อย่างน้อย 50 คน</option>
            </select>
          </div>
          <div className="search-field">
            <label htmlFor="home-equipment">
              <SlidersHorizontal className="h-3.5 w-3.5" aria-hidden="true" />
              อุปกรณ์ที่ต้องการ
            </label>
            <select
              id="home-equipment"
              value={equipment}
              onChange={(event) => setEquipment(event.target.value)}
            >
              <option value="">อุปกรณ์ใดก็ได้</option>
              <option value="Polycom Video Conference Bar">
                Video Conference
              </option>
              <option value={'85" Interactive Touch Display'}>
                จอ Interactive
              </option>
              <option value="4K Laser Projector & Screen">โปรเจกเตอร์</option>
              <option value="Smart Whiteboard & Digital Markers">
                Smart Whiteboard
              </option>
            </select>
          </div>
          <button type="submit" className="button-primary">
            ค้นหาห้อง <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </button>
        </form>
      </section>

      <div
        className="equipment-marquee"
        role="img"
        aria-label="อุปกรณ์ห้องประชุม: Video Conference, Interactive Display, Wi-Fi, Wireless Presentation และ Smart Whiteboard"
      >
        <div className="marquee-track" aria-hidden="true">
          {[0, 1].map((group) => (
            <div key={group} className="marquee-group">
              {equipmentHighlights.map(({ label, icon: Icon }) => (
                <span key={label}>
                  <Icon className="h-5 w-5" strokeWidth={1.5} />
                  {label}
                </span>
              ))}
            </div>
          ))}
        </div>
      </div>

      {spaceTypes.length > 0 && (
        <section className="home-section">
          <div className="section-heading" data-home-reveal>
            <h2>
              ทุกการประชุมมีจังหวะของตัวเอง
              <br />
              เลือกพื้นที่ให้เข้ากับทีมคุณ
            </h2>
            <p>
              คุยงานกลุ่มเล็ก ระดมไอเดีย หรือแบ่งปันความรู้
              <br />
              มีพื้นที่สำหรับทุกวิธีทำงาน
            </p>
          </div>
          <div
            className="space-accordion grid-flow-dense"
            style={{
              gridTemplateColumns: spaceTypes
                .map((_, index) => (index === openSpace ? "2fr" : "1fr"))
                .join(" "),
            }}
            data-home-reveal
          >
            {spaceTypes.map((space, index) => (
              <article
                key={space.title}
                className={
                  "space-slice " + (index === openSpace ? "is-open" : "")
                }
                onMouseEnter={() => setOpenSpace(index)}
              >
                <img src={space.room!.imageUrl} alt="" loading="lazy" />
                <button
                  type="button"
                  className="space-slice-toggle"
                  onClick={() => setOpenSpace(index)}
                  onFocus={() => setOpenSpace(index)}
                  aria-label={space.title}
                  aria-expanded={index === openSpace}
                  aria-controls={"space-details-" + index}
                />
                <div className="space-slice-content">
                  <h3>{space.title}</h3>
                  <p id={"space-details-" + index}>{space.description}</p>
                  <Link href={space.href}>
                    สำรวจห้อง{" "}
                    <ArrowUpRight className="h-4 w-4" aria-hidden="true" />
                  </Link>
                </div>
              </article>
            ))}
          </div>
        </section>
      )}

      <section className="directory-section">
        <div className="home-section directory-layout">
          <div className="directory-intro">
            <p className="mb-4 text-xs font-medium text-blue-600">
              พื้นที่ประชุมของเรา
            </p>
            <h2>
              ห้องที่พร้อม
              <br />
              สำหรับไอเดียถัดไป
            </h2>
            <p className="scroll-story">
              {[
                "เลือกพื้นที่",
                "ที่เหมาะกับทีม",
                "พร้อมอุปกรณ์",
                "สำหรับการประชุม",
                "ในบรรยากาศ",
                "ที่ช่วยให้ทุกคน",
                "โฟกัสได้เต็มที่",
              ].map((word) => (
                <span key={word}>{word}</span>
              ))}
            </p>
            <Link href="/rooms" className="button-secondary">
              ดูทั้งหมด {rooms.length} ห้อง{" "}
              <ArrowUpRight className="h-4 w-4" aria-hidden="true" />
            </Link>
            <p className="mt-6 text-xs text-slate-400">
              รายละเอียดและสถานะอัปเดตจากข้อมูลในระบบ
            </p>
          </div>
          <div className="room-directory">
            {rooms.length === 0 ? (
              <div className="rounded-2xl border border-slate-200 bg-white p-8 text-slate-500">
                ยังไม่มีห้องประชุมในระบบ
              </div>
            ) : (
              rooms.map((room) => (
                <article key={room.id} className="room-card" data-home-reveal>
                  <Link href={"/rooms/" + room.id} className="room-card-photo">
                    <img src={room.imageUrl} alt={room.name} loading="lazy" />
                    <span className="room-card-code">
                      <CodeBadge code={room.roomCode} />
                    </span>
                  </Link>
                  <div className="room-card-body">
                    <h3>
                      <Link href={"/rooms/" + room.id}>{room.name}</Link>
                    </h3>
                    <p className="room-location">
                      {room.building} · ชั้น {room.floor}
                    </p>
                    <div className="room-card-meta">
                      <span>
                        <Users className="h-3.5 w-3.5" aria-hidden="true" />
                        {room.capacity} คน
                      </span>
                      <span>
                        <Monitor className="h-3.5 w-3.5" aria-hidden="true" />
                        {room.equipment.length} อุปกรณ์
                      </span>
                    </div>
                    <div className="mt-4">
                      <StatusBadge
                        status={room.isActive ? "AVAILABLE" : "MAINTENANCE"}
                        label={room.isActive ? "เปิดให้จอง" : "ปิดปรับปรุง"}
                      />
                    </div>
                    <div className="room-card-action">
                      <button
                        type="button"
                        onClick={() => setPreviewRoom(room)}
                      >
                        ดูช่วงเวลา
                      </button>
                      <Link
                        href={
                          "/rooms/" + room.id + (room.isActive ? "/book" : "")
                        }
                      >
                        {room.isActive ? "จองห้องนี้" : "ดูรายละเอียด"}
                        <ArrowUpRight className="h-4 w-4" aria-hidden="true" />
                      </Link>
                    </div>
                  </div>
                </article>
              ))
            )}
          </div>
        </div>
      </section>

      {previewRoom && (
        <Dialog title={previewRoom.name} onClose={() => setPreviewRoom(null)}>
          <p className="mb-5 text-sm text-slate-500">{previewRoom.location}</p>
          <label className="mb-6 block text-xs font-medium text-slate-600">
            วันที่ต้องการตรวจสอบ
            <input
              type="date"
              value={previewDate}
              onChange={(event) => setPreviewDate(event.target.value)}
              className="mt-2 min-h-11 w-full rounded-xl border px-3 text-sm"
            />
          </label>
          {!previewRoom.isActive ? (
            <div className="rounded-xl bg-slate-50 p-5 text-sm text-slate-600">
              ห้องนี้ปิดปรับปรุงชั่วคราว
            </div>
          ) : previewBookings.length === 0 ? (
            <div className="rounded-xl bg-blue-50 p-5 text-sm text-blue-800">
              ยังไม่มีรายการที่อนุมัติในวันนี้ ตรวจสอบเงื่อนไขก่อนส่งคำขอจอง
            </div>
          ) : (
            <div className="space-y-3">
              {previewBookings.map((booking) => (
                <div
                  key={booking.id}
                  className="rounded-xl border border-slate-200 p-4"
                >
                  <p className="flex items-center gap-2 text-sm font-semibold text-blue-700">
                    <Clock className="h-4 w-4" aria-hidden="true" />
                    {new Date(booking.startTime).toLocaleTimeString("th-TH", {
                      hour: "2-digit",
                      minute: "2-digit",
                      timeZone: "Asia/Bangkok",
                    })}
                    –
                    {new Date(booking.endTime).toLocaleTimeString("th-TH", {
                      hour: "2-digit",
                      minute: "2-digit",
                      timeZone: "Asia/Bangkok",
                    })}
                  </p>
                  <p className="mt-2 text-sm text-slate-700">{booking.topic}</p>
                </div>
              ))}
            </div>
          )}
          <div className="mt-6 flex flex-wrap gap-2">
            <Link href="/calendar" className="button-secondary text-sm">
              ดูปฏิทิน
            </Link>
            {previewRoom.isActive && (
              <Link
                href={"/rooms/" + previewRoom.id + "/book"}
                className="button-primary text-sm"
              >
                ส่งคำขอจอง <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </Link>
            )}
          </div>
        </Dialog>
      )}
    </div>
  );
}
