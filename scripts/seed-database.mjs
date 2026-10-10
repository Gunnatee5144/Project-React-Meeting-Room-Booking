import "dotenv/config";
import pg from "pg";
import bcrypt from "bcrypt";

async function main() {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    console.error("DATABASE_URL is required to seed database.");
    process.exit(1);
  }

  const isLocal = connectionString.includes("localhost") || connectionString.includes("127.0.0.1");
  const cleanUrl = connectionString.replace("?sslmode=require", "").replace("&sslmode=require", "");

  const pool = new pg.Pool({
    connectionString: cleanUrl,
    // Verify against the provider CA when DATABASE_CA_CERT is set; otherwise fall back to
    // encrypting without verification (acceptable for a one-off seed, not for the app).
    ssl: isLocal
      ? false
      : process.env.DATABASE_CA_CERT
        ? { ca: process.env.DATABASE_CA_CERT.replace(/\\n/g, "\n").trim() }
        : { rejectUnauthorized: false },
  });

  console.log(`Connecting to PostgreSQL (${isLocal ? "local" : "remote"})...`);
  const client = await pool.connect();

  try {
    // Passwords come from the environment so no real credential lives in the repo.
    // The fallbacks are for local development only; any non-local database must set both.
    const userPassword = process.env.SEED_USER_PASSWORD;
    const adminPassword = process.env.SEED_ADMIN_PASSWORD;
    if (!isLocal && (!userPassword || !adminPassword)) {
      console.error("Set SEED_USER_PASSWORD and SEED_ADMIN_PASSWORD before seeding a non-local database.");
      process.exit(1);
    }
    console.log("Preparing password hashes...");
    const passwordHash = await bcrypt.hash(userPassword || "password123", 12);
    const adminPasswordHash = await bcrypt.hash(adminPassword || "adminpass123", 12);

    // 1. Users
    const users = [
      {
        id: "usr-1",
        name: "กันต์ธีร์ วารีสอาด",
        email: "guntee_w@cmu.ac.th",
        passwordHash,
        department: "วิทยาลัยนวัตกรรมดิจิทัล (DII)",
        role: "USER",
      },
      {
        id: "usr-2",
        name: "ศรัณย์ กระจ่างแก้ว",
        email: "saran_k@cmu.ac.th",
        passwordHash,
        department: "ภาควิชาวิศวกรรมคอมพิวเตอร์",
        role: "USER",
      },
      {
        id: "usr-3",
        name: "ณฤกส ปันด้วง",
        email: "naruekhet_p@cmu.ac.th",
        passwordHash,
        department: "วิทยาลัยนวัตกรรมดิจิทัล (DII)",
        role: "USER",
      },
      {
        id: "usr-4",
        name: "อาจารย์กิตติศักดิ์ พัฒนสุข",
        email: "kittisak_p@cmu.ac.th",
        passwordHash,
        department: "สำนักบริการเทคโนโลยีสารสนเทศ",
        role: "USER",
      },
      {
        id: "usr-5",
        name: "พัชราภรณ์ วงศ์สว่าง",
        email: "patcharaporn_w@cmu.ac.th",
        passwordHash,
        department: "กองวิเทศสัมพันธ์",
        role: "USER",
      },
      // Mock accounts for demo data. They use example.com so that a configured SMTP server can
      // never deliver a review e-mail to a real mailbox.
      {
        id: "usr-6",
        name: "ธนพล ศรีสุวรรณ",
        email: "thanaphon.mock@example.com",
        passwordHash,
        department: "คณะวิศวกรรมศาสตร์",
        role: "USER",
      },
      {
        id: "usr-7",
        name: "ปวีณา อินทรชัย",
        email: "paweena.mock@example.com",
        passwordHash,
        department: "คณะบริหารธุรกิจ",
        role: "USER",
      },
      {
        id: "usr-8",
        name: "วรเมธ จันทร์หอม",
        email: "woramet.mock@example.com",
        passwordHash,
        department: "วิทยาลัยนวัตกรรมดิจิทัล (DII)",
        role: "USER",
      },
      {
        id: "usr-9",
        name: "ศิริพร แก้วมณี",
        email: "siriporn.mock@example.com",
        passwordHash,
        department: "สำนักหอสมุด",
        role: "USER",
      },
      {
        id: "usr-admin",
        name: "ดร. สมชาย ภัทรเดช (Admin)",
        email: "admin.meeting@cmu.ac.th",
        passwordHash: adminPasswordHash,
        department: "ศูนย์เทคโนโลยีและบริหารอาคารกลาง",
        role: "ADMIN",
      },
    ];

    console.log("Seeding Users...");
    for (const u of users) {
      await client.query(
        `INSERT INTO "User" (id, name, email, "passwordHash", department, role, "createdAt")
         VALUES ($1, $2, $3, $4, $5, $6::"Role", NOW())
         ON CONFLICT (id) DO UPDATE SET
           name = EXCLUDED.name,
           department = EXCLUDED.department`,
        // Re-running the seed never resets an existing account's email, password or role.
        [u.id, u.name, u.email, u.passwordHash, u.department, u.role]
      );
    }

    // 2. Equipment
    const equipment = [
      { id: "eq-1", name: "4K Laser Projector & Screen" },
      { id: "eq-2", name: '85" Interactive Touch Display' },
      { id: "eq-3", name: "Polycom Video Conference Bar" },
      { id: "eq-4", name: "Ceiling Array Microphones" },
      { id: "eq-5", name: "High-speed Wi-Fi 6" },
      { id: "eq-6", name: "Smart Whiteboard & Digital Markers" },
      { id: "eq-7", name: "Wireless Presentation System" },
      { id: "eq-8", name: "Ergonomic Chairs & Power Sockets" },
    ];

    console.log("Seeding Equipment...");
    for (const eq of equipment) {
      await client.query(
        `INSERT INTO "Equipment" (id, name)
         VALUES ($1, $2)
         ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name`,
        [eq.id, eq.name]
      );
    }

    // 3. Rooms
    const rooms = [
      {
        id: "room-101",
        name: "Executive Horizon Boardroom",
        location: "อาคารนวัตกรรมดิจิทัล (DII) ชั้น 4",
        capacity: 24,
        imageUrl: "https://images.unsplash.com/photo-1517502884422-41eaead166d4?auto=format&fit=crop&w=1200&q=80",
        isActive: true,
        equipments: ["eq-1", "eq-3", "eq-4", "eq-5", "eq-7"],
      },
      {
        id: "room-102",
        name: "Agile Brainstorm Studio",
        location: "อาคารนวัตกรรมดิจิทัล (DII) ชั้น 3",
        capacity: 12,
        imageUrl: "https://images.unsplash.com/photo-1577495508048-b635879837f1?auto=format&fit=crop&w=1200&q=80",
        isActive: true,
        equipments: ["eq-2", "eq-5", "eq-6", "eq-8"],
      },
      {
        id: "room-103",
        name: "Nexus Seminar & Training Hall",
        location: "อาคารเรียนรวมและศูนย์ประชุม ชั้น 2",
        capacity: 60,
        imageUrl: "https://images.unsplash.com/photo-1431540015161-0bf868a2d407?auto=format&fit=crop&w=1200&q=80",
        isActive: true,
        equipments: ["eq-1", "eq-4", "eq-5", "eq-7"],
      },
      {
        id: "room-104",
        name: "Cybernetics Innovation Lab",
        location: "อาคารนวัตกรรมดิจิทัล (DII) ชั้น 5",
        capacity: 16,
        imageUrl: "https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=1200&q=80",
        isActive: true,
        equipments: ["eq-5", "eq-7", "eq-8"],
      },
      {
        id: "room-105",
        name: "Focus Pod & Interview Studio",
        location: "อาคารนวัตกรรมดิจิทัล (DII) ชั้น 2",
        capacity: 6,
        imageUrl: "https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&w=1200&q=80",
        isActive: true,
        equipments: ["eq-2", "eq-3", "eq-5"],
      },
      {
        id: "room-106",
        name: "Grand Auditorium & Town Hall",
        location: "อาคารเรียนรวมและศูนย์ประชุม ชั้น 1",
        capacity: 120,
        imageUrl: "https://images.unsplash.com/photo-1475721027785-f74eccf877e2?auto=format&fit=crop&w=1200&q=80",
        isActive: false,
        equipments: ["eq-1", "eq-4", "eq-5", "eq-7"],
      },
    ];

    console.log("Seeding Rooms & RoomEquipment...");
    for (const r of rooms) {
      await client.query(
        `INSERT INTO "Room" (id, name, location, capacity, "imageUrl", "isActive", "createdAt")
         VALUES ($1, $2, $3, $4, $5, $6, NOW())
         ON CONFLICT (id) DO UPDATE SET
           name = EXCLUDED.name,
           location = EXCLUDED.location,
           capacity = EXCLUDED.capacity,
           "imageUrl" = EXCLUDED."imageUrl",
           "isActive" = EXCLUDED."isActive"`,
        [r.id, r.name, r.location, r.capacity, r.imageUrl, r.isActive]
      );

      for (const eqId of r.equipments) {
        await client.query(
          `INSERT INTO "RoomEquipment" ("roomId", "equipmentId")
           VALUES ($1, $2)
           ON CONFLICT ("roomId", "equipmentId") DO NOTHING`,
          [r.id, eqId]
        );
      }
    }

    // 4. Bookings
    const bookings = [
      {
        id: "bk-2026-001",
        roomId: "room-101",
        userId: "usr-1",
        topic: "ประชุมวางแผนกลยุทธ์โครงงานประจำปี 2026",
        startTime: "2026-10-05T09:00:00+07:00",
        endTime: "2026-10-05T12:00:00+07:00",
        attendeeCount: 18,
        status: "APPROVED",
        adminNote: "อนุมัติเรียบร้อย เตรียมทีมงานเซ็ตระบบไมค์โครโฟนล่วงหน้า 15 นาที",
        reviewedById: "usr-admin",
      },
      {
        id: "bk-2026-002",
        roomId: "room-102",
        userId: "usr-2",
        topic: "React & Next.js Design Sprint Workshop",
        startTime: "2026-10-05T13:30:00+07:00",
        endTime: "2026-10-05T16:30:00+07:00",
        attendeeCount: 10,
        status: "APPROVED",
        adminNote: "เตรียมปากกาไวท์บอร์ดใหม่และ Post-it ให้ครบถ้วนแล้ว",
        reviewedById: "usr-admin",
      },
      {
        id: "bk-2026-003",
        roomId: "room-104",
        userId: "usr-3",
        topic: "ประชุมวางแผนงานวิจัยประจำภาคการศึกษา",
        startTime: "2026-10-06T10:00:00+07:00",
        endTime: "2026-10-06T12:00:00+07:00",
        attendeeCount: 8,
        status: "PENDING",
        adminNote: "อยู่ระหว่างตรวจสอบตารางซ้อนทับกับกิจกรรมสาขา",
        reviewedById: null,
      },
      {
        id: "bk-2026-004",
        roomId: "room-105",
        userId: "usr-1",
        topic: "สัมภาษณ์รับนักศึกษาช่วยงานวิจัย AI Assistant",
        startTime: "2026-10-07T14:00:00+07:00",
        endTime: "2026-10-07T15:30:00+07:00",
        attendeeCount: 3,
        status: "PENDING",
        adminNote: null,
        reviewedById: null,
      },
      {
        id: "bk-2026-005",
        roomId: "room-103",
        userId: "usr-4",
        topic: "บรรยายพิเศษ: Cloud-Native Architecture with PostgreSQL",
        startTime: "2026-10-08T09:00:00+07:00",
        endTime: "2026-10-08T12:00:00+07:00",
        attendeeCount: 52,
        status: "APPROVED",
        adminNote: "จัดเตรียมไมค์ลอย 3 ตัว พร้อมช่างภาพนิ่งประจำงาน",
        reviewedById: "usr-admin",
      },
      {
        id: "bk-2026-006",
        roomId: "room-101",
        userId: "usr-5",
        topic: "การประชุมหารือความร่วมมือมหาวิทยาลัยคู่สัญญา",
        startTime: "2026-09-29T13:00:00+07:00",
        endTime: "2026-09-29T15:00:00+07:00",
        attendeeCount: 8,
        status: "REJECTED",
        adminNote: "ขออภัย ในช่วงเวลาดังกล่าวอาคารปิดระบบปรับอากาศหลักตามมาตรการประหยัดพลังงาน",
        reviewedById: "usr-admin",
      },
    ];

    console.log("Seeding Bookings...");
    for (const b of bookings) {
      await client.query(
        `INSERT INTO "Booking" (id, "roomId", "userId", topic, "startTime", "endTime", "attendeeCount", status, "adminNote", "reviewedById", "createdAt", "updatedAt")
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8::"BookingStatus", $9, $10, NOW(), NOW())
         ON CONFLICT (id) DO UPDATE SET
           "roomId" = EXCLUDED."roomId",
           "userId" = EXCLUDED."userId",
           topic = EXCLUDED.topic,
           "startTime" = EXCLUDED."startTime",
           "endTime" = EXCLUDED."endTime",
           "attendeeCount" = EXCLUDED."attendeeCount",
           status = EXCLUDED.status,
           "adminNote" = EXCLUDED."adminNote",
           "reviewedById" = EXCLUDED."reviewedById"`,
        [
          b.id,
          b.roomId,
          b.userId,
          b.topic,
          // Columns are "timestamp without time zone" holding UTC (what Prisma reads/writes).
          // Passing "...+07:00" text would silently drop the offset, so convert to UTC first.
          new Date(b.startTime).toISOString(),
          new Date(b.endTime).toISOString(),
          b.attendeeCount,
          b.status,
          b.adminNote,
          b.reviewedById,
        ]
      );
    }

    // 5. Mock bookings relative to the day the seed runs, so the calendar, "my bookings", the
    // admin queue and the reports always have past, current and upcoming data to show.
    // [day offset, room, user, start, end, attendees, status, topic, admin note]
    // Offsets count working days (weekends are skipped); 0 is today.
    const mockBookings = [
      [-12, "room-105", "usr-2", "09:00", "10:00", 5, "APPROVED", "Code Review ประจำสัปดาห์", null],
      [-10, "room-101", "usr-6", "13:00", "15:00", 16, "APPROVED", "ประชุมความร่วมมือภาคอุตสาหกรรม", null],
      [-9, "room-103", "usr-4", "09:00", "11:00", 50, "APPROVED", "ปฐมนิเทศผู้ช่วยสอน", "จัดที่นั่งแบบห้องเรียนเรียบร้อยแล้ว"],
      [-8, "room-102", "usr-3", "14:00", "16:00", 11, "REJECTED", "กิจกรรมชมรมบอร์ดเกม", "ห้องนี้สงวนไว้สำหรับการเรียนการสอนและการประชุมงาน"],
      [-7, "room-104", "usr-8", "10:00", "12:00", 10, "APPROVED", "ซ้อมนำเสนอโครงงานจบการศึกษา", null],
      [-6, "room-101", "usr-7", "09:00", "12:00", 22, "APPROVED", "ประชุมแผนงบประมาณประจำไตรมาส", null],
      [-5, "room-105", "usr-5", "15:00", "16:00", 3, "CANCELLED", "สัมภาษณ์นักศึกษาแลกเปลี่ยน", "ยกเลิกโดยผู้ใช้: ผู้สัมภาษณ์ติดภารกิจ"],
      [-4, "room-102", "usr-1", "09:30", "11:30", 8, "APPROVED", "UX Review หน้าเว็บจองห้อง", null],
      [-4, "room-103", "usr-9", "13:00", "16:00", 38, "APPROVED", "สัมมนาการสืบค้นฐานข้อมูลวิจัย", null],
      [-3, "room-104", "usr-6", "13:30", "16:00", 12, "APPROVED", "Workshop IoT เบื้องต้น", null],
      [-3, "room-101", "usr-2", "14:00", "16:00", 20, "APPROVED", "ประชุมทบทวนสถาปัตยกรรมระบบ", null],
      [-2, "room-103", "usr-7", "09:00", "12:00", 45, "APPROVED", "อบรมการใช้ระบบสารบรรณอิเล็กทรอนิกส์", null],
      [-2, "room-105", "usr-3", "10:00", "11:00", 4, "APPROVED", "ประชุมกลุ่มโครงงาน React", null],
      [-1, "room-101", "usr-4", "09:00", "11:00", 14, "APPROVED", "ประชุมคณะกรรมการบริหารหลักสูตร", null],
      [-1, "room-102", "usr-8", "13:00", "15:00", 9, "APPROVED", "Sprint Review ทีมพัฒนาแอปนักศึกษา", null],
      [0, "room-102", "usr-9", "15:00", "17:00", 6, "APPROVED", "ประชุมทีมบริการสารสนเทศ", null],
      [0, "room-104", "usr-8", "18:00", "19:30", 12, "PENDING", "ติวสอบกลางภาค Data Structures", null],
      [1, "room-101", "usr-1", "09:00", "11:00", 15, "APPROVED", "ประชุมเตรียมนำเสนอ Final Project", "อนุมัติ เปิดห้องให้ก่อนเวลา 15 นาที"],
      [1, "room-102", "usr-3", "13:00", "15:00", 8, "PENDING", "ทดสอบระบบจองห้องร่วมกับผู้ใช้จริง", null],
      [1, "room-103", "usr-4", "09:00", "12:00", 55, "APPROVED", "บรรยายพิเศษ: AI สำหรับงานบริการนักศึกษา", null],
      [2, "room-105", "usr-2", "10:00", "11:30", 4, "PENDING", "ประชุมออกแบบฐานข้อมูลรอบสอง", null],
      [2, "room-101", "usr-7", "13:30", "16:30", 20, "PENDING", "ประชุมคณะกรรมการจัดงาน Open House", null],
      [2, "room-104", "usr-6", "09:00", "12:00", 14, "APPROVED", "Workshop การเขียน API ด้วย Next.js", null],
      [3, "room-102", "usr-1", "09:00", "10:30", 6, "PENDING", "Retrospective ทีม Frontend", null],
      [3, "room-103", "usr-9", "13:00", "16:00", 40, "APPROVED", "อบรมการอ้างอิงและป้องกันการคัดลอกผลงาน", null],
      [3, "room-105", "usr-3", "14:00", "15:00", 3, "APPROVED", "ซ้อมนำเสนอระบบแจ้งเตือนอีเมล", null],
      [4, "room-101", "usr-5", "10:00", "12:00", 12, "PENDING", "ต้อนรับคณะผู้แทนมหาวิทยาลัยต่างประเทศ", null],
      [4, "room-104", "usr-2", "13:00", "15:00", 10, "CANCELLED", "ทดสอบโหลดระบบฐานข้อมูล", "ยกเลิกโดยผู้ใช้: เลื่อนไปสัปดาห์ถัดไป"],
      [5, "room-102", "usr-8", "13:00", "16:00", 12, "APPROVED", "Hackathon Kickoff ทีมนักศึกษา", null],
      [5, "room-103", "usr-7", "09:00", "11:00", 30, "REJECTED", "กิจกรรมขายสินค้าชมรม", "ไม่อนุญาตให้ใช้ห้องประชุมเพื่อกิจกรรมเชิงพาณิชย์"],
      [6, "room-101", "usr-3", "09:00", "10:30", 10, "APPROVED", "ประชุมสรุปผลการทดสอบระบบ", null],
      [7, "room-105", "usr-1", "09:30", "10:30", 2, "APPROVED", "สัมภาษณ์ผู้ใช้งานระบบจองห้อง", null],
      [8, "room-104", "usr-4", "10:00", "12:00", 16, "PENDING", "อบรมความปลอดภัยไซเบอร์สำหรับบุคลากร", null],
      [10, "room-102", "usr-6", "09:00", "12:00", 10, "PENDING", "Design Thinking Workshop", null],
    ];

    const DAY_MS = 24 * 60 * 60 * 1000;
    const bangkokDate = (date) => new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Bangkok" }).format(date);
    // Noon UTC of the Bangkok calendar day keeps the weekday stable while stepping whole days.
    const workday = (offset) => {
      let day = new Date(`${bangkokDate(new Date())}T12:00:00Z`);
      for (let left = Math.abs(offset); left > 0; ) {
        day = new Date(day.getTime() + Math.sign(offset) * DAY_MS);
        if (day.getUTCDay() !== 0 && day.getUTCDay() !== 6) left--;
      }
      return day.toISOString().slice(0, 10);
    };

    console.log("Seeding mock bookings...");
    let added = 0;
    let skipped = 0;
    for (const [index, [offset, roomId, userId, start, end, attendeeCount, status, topic, adminNote]] of mockBookings.entries()) {
      const date = workday(offset);
      const startTime = new Date(`${date}T${start}:00+07:00`);
      const endTime = new Date(`${date}T${end}:00+07:00`);
      // Requests are normally made a couple of days ahead; never date them in the future.
      const createdAt = new Date(Math.min(Date.now(), startTime.getTime() - 2 * DAY_MS));
      const reviewed = status === "APPROVED" || status === "REJECTED";
      // A fixed id keeps a re-run from moving or duplicating a row. Each row has its own
      // transaction so it can be skipped when the slot is already held by another booking
      // (exclusion constraint) without aborting the rest of the seed.
      await client.query("BEGIN");
      try {
        const result = await client.query(
          `INSERT INTO "Booking" (id, "roomId", "userId", topic, "startTime", "endTime", "attendeeCount", status, "adminNote", "reviewedById", "createdAt", "updatedAt")
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8::"BookingStatus", $9, $10, $11, $11)
           ON CONFLICT (id) DO NOTHING`,
          [
            `mock-${String(index + 1).padStart(3, "0")}`,
            roomId,
            userId,
            topic,
            startTime.toISOString(),
            endTime.toISOString(),
            attendeeCount,
            status,
            adminNote,
            reviewed ? "usr-admin" : null,
            createdAt.toISOString(),
          ]
        );
        await client.query("COMMIT");
        added += result.rowCount ?? 0;
      } catch (error) {
        await client.query("ROLLBACK");
        if (error?.code !== "23P01") throw error;
        skipped++;
      }
    }
    console.log(`Mock bookings: ${added} added, ${skipped} skipped because the slot was already taken.`);

    console.log("Seed completed successfully!");
  } finally {
    client.release();
    await pool.end();
  }
}

main().catch((err) => {
  console.error("Seed failed:", err);
  process.exit(1);
});
