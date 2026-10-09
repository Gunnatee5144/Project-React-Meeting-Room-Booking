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
    ssl: isLocal ? false : { rejectUnauthorized: false },
  });

  console.log("Connecting to PostgreSQL on Aiven...");
  const client = await pool.connect();

  try {
    console.log("Preparing default password hash...");
    const passwordHash = await bcrypt.hash("password123", 10);

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
      {
        id: "usr-admin",
        name: "ดร. สมชาย ภัทรเดช (Admin)",
        email: "admin.meeting@cmu.ac.th",
        passwordHash,
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
           email = EXCLUDED.email,
           "passwordHash" = EXCLUDED."passwordHash",
           department = EXCLUDED.department,
           role = EXCLUDED.role`,
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
          b.startTime,
          b.endTime,
          b.attendeeCount,
          b.status,
          b.adminNote,
          b.reviewedById,
        ]
      );
    }

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
