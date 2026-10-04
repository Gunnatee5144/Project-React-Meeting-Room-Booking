# Meeting Room Booking — Basecode

โครงสร้างเริ่มต้นสำหรับสมาชิกแยก branch ไปพัฒนา ตาม proposal ด้านล่าง

## เริ่มใช้งาน

ใช้ Node.js 24.x และ npm (ดู `.nvmrc`) รันจาก root ของ repository:

```sh
npm ci
npm run dev
```

เปิด `http://localhost:3000` ได้ทันที หน้า placeholder ไม่ต้องใช้ PostgreSQL หรือ `.env` และ `npm ci` จะ generate Prisma Client ให้แล้ว

เมื่อต้องเริ่มงานฐานข้อมูล ให้คัดลอก `.env.example` เป็น `.env` แล้วแก้ `DATABASE_URL` ให้ตรง PostgreSQL ของตนเอง:

```powershell
Copy-Item .env.example .env
```

```sh
npm run db:validate
npm run db:generate
```

ผู้รับผิดชอบฐานข้อมูลสร้าง migration แรกและ exclusion constraint พร้อมกัน ก่อนทีมเริ่มใช้ฐานข้อมูลร่วมกัน ไม่ใช้ `db push` แทน migration เพราะจะไม่ได้ constraint ป้องกันการจองซ้อน

```sh
npm run db:migrate -- --name init --create-only
# Add the exclusion constraint from the proposal to the generated migration.sql.
npm run db:migrate
```

ยังไม่มี seed script ให้เพิ่มเมื่อพัฒนา Seed Data แล้ว ห้าม commit `.env`, รหัสผ่านจริง หรือ Prisma Client ที่ generate แล้ว

## สิ่งที่เตรียมไว้

- Next.js App Router + React + TypeScript (strict mode) + Tailwind CSS
- ESLint, alias `@/*` สำหรับ `src/*`, `.editorconfig`, `.gitignore`, `.env.example`, npm lockfile
- ทุก page route ใน proposal รวมหน้า Admin แบบ Optional เป็น placeholder เท่านั้น
- Prisma schema ตาม proposal พร้อม config และ `getPrisma()` ใน `src/lib/prisma.ts` สำหรับเรียกจาก server โดยไม่เปิด connection ตอนโหลดหน้า placeholder
- Dependencies สำหรับ React Hook Form, Zod, FullCalendar, bcrypt และ Nodemailer พร้อมใช้ใน branch ของแต่ละคน

ยังไม่ได้ทำ UI จริง, AuthContext, session, guards, Server Actions, `GET /api/bookings`, migration, exclusion constraint, seed, อีเมล หรือ logic การจอง หน้า Admin ยังเป็น placeholder เปิดได้ทั่วไป ห้ามใช้กับข้อมูลจริงก่อนเพิ่มการตรวจ session และสิทธิ์บน server

## โครงสร้างสำหรับแบ่งงาน

```text
prisma/
  schema.prisma          # Shared models from the proposal
  migrations/            # Database owner adds migrations and SQL constraint
public/                  # Static assets
src/
  app/                   # Page routes, layout, global CSS
    api/bookings/        # Reserved for GET /api/bookings (not implemented)
    admin/               # Optional page placeholders
  actions/               # Server Actions, grouped by feature
  components/            # Shared UI; placeholder-page.tsx is temporary
  context/               # AuthContext implementation goes here
  lib/
    prisma.ts            # Server-only Prisma Client getter
    auth/                # Session and permission helpers
    email/               # SMTP helpers
  schemas/               # Shared Zod schemas
  types/                 # Shared application types and interfaces
```

โฟลเดอร์ว่างมี `.gitkeep` เพื่อเก็บใน Git ยังไม่ได้ตกลง interface ของ session หรือ Server Actions ให้ทีมตกลงก่อนเขียนฟีเจอร์ตามหัวข้อ 7

## แยก branch ทำงาน

หลังนำ basecode เข้า branch หลักแล้ว ให้แต่ละคน checkout branch หลักล่าสุด แล้วสร้าง branch ของงานตัวเอง เช่น:

```sh
git switch -c feature/database-auth
# Other members use feature/rooms-ui or feature/booking-calendar.
```

- Database / Auth: `prisma/`, `src/lib/auth/`, `src/context/`, `src/schemas/`, `src/types/`, หน้า register/login, API bookings และงาน Admin ที่รับผิดชอบ
- Frontend / Rooms: layout, shared components, หน้าแรก, profile, rooms และ admin/rooms
- Booking / Calendar / Email: rooms/[id]/book, calendar, my-bookings, admin/bookings และ src/lib/email

ไฟล์ร่วม เช่น `package.json`, `prisma/schema.prisma`, root layout และ types ควรตกลงก่อนแก้ เพื่อลด merge conflict ใช้ `npm ci` ตาม lockfile เมื่อต้องเพิ่ม package ให้ commit `package.json` และ `package-lock.json` พร้อมกัน

## ตรวจสอบก่อนส่งงาน

```sh
npm run lint
npm run typecheck
npm run db:validate
npm run build
```

`npm run build` สร้าง production build และ `npm start` ใช้เปิด build นั้น

ตั้งค่า framework ตาม [Next.js installation](https://nextjs.org/docs/app/getting-started/installation) และ Prisma 7 ใช้ config แยกกับ PostgreSQL adapter ตาม [Prisma 7 guide](https://docs.prisma.io/docs/guides/upgrade-prisma-orm/v7)

---

# Final Project Proposal – ระบบจองห้องประชุมออนไลน์

กลุ่ม: [มหาเทพโฟค] · สมาชิก: [682110161 กันต์ธีร์ วารีสอาด], [682110193 ศรัณย์ กระจ่างแก้ว], [682110169 ณฤกส ปันด้วง]

## 1. แอปนี้ทำอะไร ใครใช้

เว็บแอปพลิเคชันสำหรับบุคลากรและนักศึกษา ใช้ค้นหาห้องประชุมว่าง ดูตารางการใช้งาน จองห้อง และติดตามสถานะคำขอได้ด้วยตนเอง ลดปัญหาการจองผ่านโทรศัพท์หรือข้อความที่ตรวจสอบยากและเกิดการจองซ้อนเวลา

ผู้ดูแลระบบสามารถจัดการห้องและผู้ใช้ อนุมัติหรือปฏิเสธคำขอ พร้อมดูสถิติการใช้งาน โดยระบบตรวจสอบช่วงเวลาที่ทับซ้อนและส่งอีเมลแจ้งผลการอนุมัติหรือปฏิเสธ

ใช้ Next.js App Router + React + TypeScript, Tailwind CSS และ PostgreSQL + Prisma โดยใช้ Server Components, Client Components และ Server Actions ตามแบบฟอร์มรายวิชา รองรับ Responsive Web; ไม่รวมการชำระเงิน การเชื่อม Google Calendar / Outlook และแอปมือถือแบบ Native

## 2. หน้าที่จะมี (อย่างน้อย 4 route)

| Route | หน้านี้ทำอะไร |
| --- | --- |
| `/` | หน้าแรก แนะนำระบบและลิงก์ค้นหาห้อง ดูปฏิทิน และรายการจองของฉัน |
| `/register` | สมัครสมาชิกด้วยชื่อ อีเมล รหัสผ่าน และหน่วยงาน |
| `/login` | เข้าสู่ระบบและนำผู้ใช้ไปยังหน้าที่เหมาะสมกับสิทธิ์ User / Admin |
| `/profile` | ดูและแก้ไขข้อมูลส่วนตัว พร้อมปุ่มออกจากระบบ |
| `/rooms` | แสดงห้องทั้งหมด ค้นหาห้องว่างตามวัน เวลา จำนวนผู้เข้าร่วม และอุปกรณ์ โดยเก็บตัวกรองใน URL |
| `/rooms/[id]` | รายละเอียดห้อง รูปภาพ สถานที่ ความจุ อุปกรณ์ สถานะเปิดใช้งาน และตารางจอง |
| `/rooms/[id]/book` | ฟอร์มจองห้อง ระบุหัวข้อประชุม วัน เวลาเริ่ม–สิ้นสุด และจำนวนผู้เข้าร่วม |
| `/calendar` | ปฏิทินการใช้ห้องแบบรายวัน / รายสัปดาห์ เลือกห้องและเปลี่ยนวันที่ได้ |
| `/my-bookings` | รายการและประวัติการจองของผู้ใช้ ดูสถานะ แก้ไขคำขอที่ยังไม่ถึงเวลา และยกเลิกตามเงื่อนไข |
| `/admin/rooms` (Optional) | เพิ่ม แก้ไข ลบห้องที่ไม่มีประวัติการจอง หรือปิดใช้งานห้อง รวมถึงจัดการอุปกรณ์และรูปภาพหลักของห้อง (เก็บเป็น URL) |
| `/admin/bookings` (Optional) | ตรวจคำขอจอง อนุมัติหรือปฏิเสธ พร้อมระบุเหตุผล |
| `/admin/users` (Optional) | จัดการข้อมูลผู้ใช้และกำหนดสิทธิ์ User / Admin |
| `/admin/reports` (Optional) | รายงานอัตราการใช้ห้อง ห้องที่ถูกจองมากที่สุด และช่วงเวลายอดนิยม พร้อมเลือกช่วงวันที่ |

**ขอบเขตงาน:** ฝั่งผู้ใช้ (`/`, `/register`, `/login`, `/profile`, `/rooms`, `/rooms/[id]`, `/rooms/[id]/book`, `/calendar`, `/my-bookings`) เป็นงานหลักที่ต้องเสร็จก่อน ส่วนหน้า `/admin/*` เป็นงานเสริม ทำเมื่อฝั่งผู้ใช้เสร็จและทดสอบแล้ว หากเวลาไม่พอจะลำดับความสำคัญเป็น `/admin/bookings` → `/admin/rooms` → `/admin/users` → `/admin/reports` เพราะการอนุมัติคำขอจองต้องผ่าน `/admin/bookings` ระหว่างที่ยังไม่มีหน้านี้ ห้องและ Admin ตัวอย่างจัดการผ่าน Seed Data และคำขอจองจะค้างสถานะ `PENDING` (ซึ่งยังกันเวลาจองซ้อนได้ตามปกติ)

## 3. Server หรือ Client – และทำไม

| ส่วนของแอป | Server / Client | เหตุผล |
| --- | --- | --- |
| หน้า `/rooms` และ `/rooms/[id]` | Server Component | อ่านข้อมูลห้องจาก PostgreSQL ผ่าน Prisma บน server โดยไม่ส่งโค้ดเชื่อมฐานข้อมูลไปยัง browser |
| ช่องค้นหาและตัวกรองห้อง | Client Component | ต้องใช้ state และ event เพื่อเปลี่ยนตัวกรอง แล้วปรับ URL ให้หน้า Server ดึงข้อมูลตามเงื่อนไข |
| ฟอร์มสมัครสมาชิก เข้าสู่ระบบ แก้ไขโปรไฟล์ และจองห้อง | Client Component | ต้องรับข้อมูล ตรวจความครบถ้วน และแสดงสถานะกำลังส่งหรือข้อผิดพลาด โดยใช้ React Hook Form + Zod |
| ปฏิทิน FullCalendar | Client Component | ต้องโต้ตอบกับผู้ใช้ เช่น เลือกวัน เปลี่ยนมุมมอง และคลิกรายการจอง โดยรับข้อมูลที่ตรวจสิทธิ์แล้วจาก server |
| `/my-bookings` และหน้า Admin | Server Component | ตรวจ session และสิทธิ์ก่อนอ่านข้อมูล ผู้ใช้เห็นเฉพาะการจองของตน ส่วนข้อมูลจัดการระบบเข้าถึงได้เฉพาะ Admin |
| ปุ่มแก้ไข ยกเลิก อนุมัติ และปฏิเสธ | Client Component | ต้องรับ event แสดงหน้าต่างยืนยัน และสถานะผลลัพธ์ก่อนหรือหลังเรียก Server Action |
| การบันทึกข้อมูลและตรวจเงื่อนไขการจอง | Server Action | ตรวจตัวตน สิทธิ์ และข้อมูลซ้ำบน server ก่อนเขียนฐานข้อมูล ไม่เชื่อถือเฉพาะการตรวจฝั่ง client |
| Layout และเมนูหลัก | Server Component | แสดงโครงสร้างหน้าและเมนูตาม session; แยกเมนูมือถือหรือส่วนที่ต้องใช้ event เป็น Client Component |

## 4. ข้อมูลมาจากไหน + จุดที่ต้องเขียนข้อมูลกลับ

**แหล่งข้อมูล:** PostgreSQL เชื่อมผ่าน Prisma ใช้ตาราง `users`, `rooms`, `equipment`, `room_equipment` และ `bookings` เตรียม Seed Data สำหรับห้อง อุปกรณ์ และบัญชี Admin ตัวอย่าง 1 บัญชี (บัญชีที่สมัครผ่าน `/register` เป็น `USER` เสมอ) ส่วนข้อมูลผู้ใช้และการจองอื่นมาจากการใช้งานจริง

ตาราง `bookings` เก็บผู้จอง ห้อง หัวข้อประชุม เวลาเริ่ม–สิ้นสุด จำนวนผู้เข้าร่วม หมายเหตุผู้ดูแล และสถานะ `PENDING`, `APPROVED`, `REJECTED`, `CANCELLED`

**การอ่านข้อมูล:** Server Components อ่านฐานข้อมูลโดยตรง ข้อมูลตารางจองและห้องว่างอ่านใหม่เมื่อเปิดหน้า เปลี่ยนตัวกรอง หรือบันทึกคำขอ ไม่ใช้ข้อมูลห้องว่างที่ cache ไว้นานเป็นตัวตัดสินการจอง ปฏิทินที่เปลี่ยนช่วงวันที่เรียก `GET /api/bookings` ผ่าน Route Handler ซึ่งตรวจ session และจำกัดข้อมูลตามสิทธิ์

**จุดที่เขียนข้อมูลกลับ:**

- `registerUser`, `loginUser`, `logoutUser` และ `updateProfile`: Server Actions จาก `/register`, `/login` และ `/profile` สำหรับสร้างบัญชี เข้าสู่ระบบ ออกจากระบบ (ล้าง session cookie) และแก้ไขข้อมูลส่วนตัว เก็บรหัสผ่านแบบ hash ด้วย bcrypt
- `createBooking`: Server Action จาก `/rooms/[id]/book` ตรวจห้องและช่วงเวลา แล้วสร้างคำขอสถานะ `PENDING`
- `updateBooking` และ `cancelBooking`: Server Actions จาก `/my-bookings` ตรวจว่าเป็นเจ้าของรายการและผ่านเงื่อนไขก่อนแก้ไขหรือเปลี่ยนสถานะเป็น `CANCELLED`; การแก้ไขส่งกลับเป็น `PENDING` เพื่อให้ผู้ดูแลพิจารณาใหม่
- `reviewBooking`: Server Action จาก `/admin/bookings` ตรวจสิทธิ์ Admin แล้วเปลี่ยนสถานะเป็น `APPROVED` หรือ `REJECTED` พร้อมบันทึกเหตุผล และส่งอีเมลผ่าน Nodemailer / SMTP หลังบันทึกสำเร็จ
- `createRoom`, `updateRoom`, `deleteRoom` และ `updateUserRole`: Server Actions จาก `/admin/rooms` และ `/admin/users` ตรวจสิทธิ์ Admin ทุกครั้ง ห้องที่มีประวัติการจองใช้การปิดใช้งานเพื่อรักษาข้อมูลย้อนหลัง
- หลัง mutation ใช้ `revalidatePath` กับหน้าที่เกี่ยวข้อง เช่น `/rooms`, `/rooms/[id]`, `/calendar`, `/my-bookings`, `/admin/bookings` และ `/admin/reports` แล้วให้ปฏิทินโหลดข้อมูลใหม่เพื่อแสดงสถานะล่าสุด

**เงื่อนไขสำคัญที่ตรวจบน server:**

- ห้ามจองห้องเดียวกันทับซ้อนกับรายการสถานะ `PENDING` หรือ `APPROVED`; ช่วงเวลาต่อกัน เช่น 09:00–10:00 และ 10:00–11:00 จองได้
- เวลาเริ่มต้องอยู่ในอนาคต เวลาสิ้นสุดต้องมากกว่าเวลาเริ่ม และจองล่วงหน้าได้ไม่เกิน 30 วัน
- จำนวนผู้เข้าร่วมต้องเป็นจำนวนเต็มบวก ไม่เกินความจุห้อง และห้องต้องเปิดใช้งาน
- แก้ไขได้เฉพาะรายการของตนที่ยังไม่ถึงเวลาและมีสถานะ `PENDING` หรือ `APPROVED`; ตรวจช่วงเวลาซ้ำโดยไม่นับรายการเดิม
- ยกเลิกได้เฉพาะรายการของตนที่มีสถานะ `PENDING` หรือ `APPROVED` ก่อนเริ่มอย่างน้อย 1 ชั่วโมง
- ใช้ transaction ร่วมกับ PostgreSQL exclusion constraint สำหรับห้องและช่วงเวลาของรายการ `PENDING` / `APPROVED` เพื่อป้องกันการจองซ้อนเมื่อหลายคนส่งคำขอพร้อมกัน

ยืนยันตัวตนด้วย session ใน cookie แบบ HttpOnly ตรวจเจ้าของข้อมูลและสิทธิ์จาก session ฝั่ง server ทุก mutation และทุก Route Handler ที่เกี่ยวข้อง

## 5. Global State

เนื่องจากแอปใช้ Next.js Server Components เป็นหลัก จึงไม่ต้องใช้ Global State store ขนาดใหญ่ แต่มีข้อมูลผู้ใช้ที่ Client Component หลายจุดต้องใช้ร่วมกัน จึงเพิ่ม `AuthContext` ด้วย React Context API 1 จุด

**AuthContext:** เก็บข้อมูลผู้ใช้ที่เข้าสู่ระบบ (`id`, `name`, `email`, `role`) โดยอ่านค่าเริ่มต้นจาก session ฝั่ง server แล้วส่งเข้า Provider ที่ครอบอยู่ใน root layout Client Component ที่ต้องรู้ตัวตนหรือสิทธิ์ผู้ใช้ เช่น Navbar, ปุ่มออกจากระบบ, ฟอร์มจองห้อง (`/rooms/[id]/book`) และปุ่มอนุมัติ/ปฏิเสธใน `/admin/bookings` เรียกใช้ค่าจาก context ผ่าน hook `useAuth()` ได้ทันที โดยไม่ต้องส่ง props ลงหลายชั้นและไม่ต้อง fetch ข้อมูลผู้ใช้ซ้ำในแต่ละ component

```tsx
// context/AuthContext.tsx
type AuthUser = { id: string; name: string; email: string; role: "USER" | "ADMIN" };

const AuthContext = createContext<AuthUser | null>(null);

export function AuthProvider({ user, children }: { user: AuthUser | null; children: React.ReactNode }) {
  return <AuthContext.Provider value={user}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  return useContext(AuthContext);
}
```

`app/layout.tsx` (Server Component) อ่าน session แล้วส่งค่าเริ่มต้นให้ `AuthProvider` ครอบ children ทั้งหมด

## 6. Database Schema (Prisma)

โครงสร้างตารางตามที่ระบุในหัวข้อ 4 เขียนเป็น Prisma schema ดังนี้:

```prisma
enum Role {
  USER
  ADMIN
}

enum BookingStatus {
  PENDING
  APPROVED
  REJECTED
  CANCELLED
}

model User {
  id               String    @id @default(cuid())
  name             String
  email            String    @unique
  passwordHash     String
  department       String?
  role             Role      @default(USER)
  createdAt        DateTime  @default(now())
  bookings         Booking[] @relation("BookingUser")
  reviewedBookings Booking[] @relation("BookingReviewer")
}

model Room {
  id        String          @id @default(cuid())
  name      String
  location  String
  capacity  Int
  imageUrl  String?
  isActive  Boolean         @default(true)
  createdAt DateTime        @default(now())
  equipment RoomEquipment[]
  bookings  Booking[]
}

model Equipment {
  id    String          @id @default(cuid())
  name  String          @unique
  rooms RoomEquipment[]
}

model RoomEquipment {
  roomId      String
  equipmentId String
  room        Room      @relation(fields: [roomId], references: [id], onDelete: Cascade)
  equipment   Equipment @relation(fields: [equipmentId], references: [id], onDelete: Cascade)

  @@id([roomId, equipmentId])
}

model Booking {
  id            String        @id @default(cuid())
  roomId        String
  userId        String
  topic         String
  startTime     DateTime
  endTime       DateTime
  attendeeCount Int
  status        BookingStatus @default(PENDING)
  adminNote     String?
  reviewedById  String?
  createdAt     DateTime      @default(now())
  updatedAt     DateTime      @updatedAt

  room       Room  @relation(fields: [roomId], references: [id])
  user       User  @relation("BookingUser", fields: [userId], references: [id])
  reviewedBy User? @relation("BookingReviewer", fields: [reviewedById], references: [id])

  @@index([roomId, startTime, endTime])
}
```

ป้องกันการจองซ้อนเวลาที่ระดับฐานข้อมูล (นอกเหนือจากการตรวจใน Server Action) ด้วย exclusion constraint ผ่าน raw SQL migration:

```sql
CREATE EXTENSION IF NOT EXISTS btree_gist;

ALTER TABLE "Booking"
  ADD CONSTRAINT no_overlapping_bookings
  EXCLUDE USING gist (
    "roomId" WITH =,
    tsrange("startTime", "endTime") WITH &&
  )
  WHERE (status IN ('PENDING', 'APPROVED'));
```

## 7. แบ่งงานกันยังไง

การแบ่งงานเบื้องต้นสำหรับสมาชิก 3 คน:

- **[682110193 ศรัณย์ กระจ่างแก้ว] (Database, Auth & Core Logic):** ออกแบบฐานข้อมูลและ Prisma (Schema, Migration, exclusion constraint, Seed Data), ระบบสมาชิกและตรวจสิทธิ์ (`/register`, `/login`, `registerUser`, `loginUser`, `logoutUser`, Session, `AuthContext`, Guard User / Admin), Zod Schema กลางและเงื่อนไขการจองบน Server, Route Handler `GET /api/bookings`, เตรียม deploy และงานเสริม `/admin/users` พร้อม `updateUserRole`, `/admin/reports`
- **[682110161 กันต์ธีร์ วารีสอาด] (Frontend UI & Room Management):** Responsive Layout, เมนูหลักและ Design System หลัก, หน้า `/`, `/profile` พร้อม `updateProfile`, `/rooms` พร้อมตัวกรองค้นหาที่เก็บใน URL, `/rooms/[id]` และงานเสริม `/admin/rooms` พร้อม `createRoom`, `updateRoom`, `deleteRoom`
- **[682110169 ณฤกส ปันด้วง] (Booking Workflow, Calendar & Email Notifications):** ฟอร์ม `/rooms/[id]/book` พร้อม `createBooking`, FullCalendar (`/calendar`), `/my-bookings` พร้อม `updateBooking`, `cancelBooking` และงานเสริม `/admin/bookings` พร้อม `reviewBooking` และระบบส่งอีเมลแจ้งผลผ่าน Nodemailer / SMTP
- **ทำร่วมกัน:** ตกลง Type และ Interface ของ Data Layer ตั้งแต่วันแรกเพื่อให้ทำงานขนานกันได้, เชื่อม UI กับ Server Actions, ทดสอบสิทธิ์ User / Admin และกรณีจองเวลาเดียวกันพร้อมกัน, จัดทำเอกสารและเตรียมนำเสนอ

## 8. Checklist ตามเกณฑ์ของอาจารย์

ส่วนที่ทำเสร็จแล้วในงานของ Gun (Frontend UI & Room Management) แต่ละไฟล์มีคอมเมนต์ด้านบนอธิบายเหตุผลของ Server/Client

- [x] **1. Next.js App Router อย่างน้อย 4 route** — Gun ทำเสร็จ 5 route: `/`, `/rooms`, `/rooms/[id]`, `/profile`, `/admin/rooms` (พร้อม `loading.tsx`, `error.tsx`, `not-found.tsx`)
- [x] **2. มีทั้ง Server และ Client Component พร้อมเหตุผล**
  - Server Component: `app/page.tsx`, `app/rooms/page.tsx`, `app/rooms/[id]/page.tsx`, `app/profile/page.tsx`, `app/admin/rooms/page.tsx`, `app/layout.tsx` ดึงข้อมูลและตรวจสิทธิ์บน server จึงไม่ส่ง JS ที่ไม่จำเป็นไปที่ browser
  - Client Component: `navigation.tsx` (เมนูมือถือ, active link), `room-filters.tsx` (ฟอร์มตัวกรองเก็บค่าใน URL), `room-form.tsx` / `profile-form.tsx` (react-hook-form), `delete-room-button.tsx` / `equipment-manager.tsx` (ขั้นตอนยืนยัน, สถานะ pending), `room-image.tsx` (fallback เมื่อรูปโหลดไม่ได้), `context/AuthContext.tsx` และไฟล์ `error.tsx` (error boundary ต้องเป็น Client Component)
- [x] **3. Data fetching ด้วย SSR โดยเจตนา** — `/rooms` และ `/rooms/[id]` ใช้ `export const dynamic = "force-dynamic"` เพราะผลลัพธ์ขึ้นกับ `searchParams` (วัน เวลา ความจุ อุปกรณ์) และการจองที่เปลี่ยนตลอดเวลา ถ้า cache แบบ SSG/ISR อาจแสดงห้องที่ถูกจองไปแล้วว่าเป็นห้องว่าง ส่วนหน้าแรกไม่มีข้อมูลจาก DB
  - หมายเหตุ: `app/layout.tsx` อ่านคุกกี้ session ทุก request ทำให้ทุก route render ตอน request ไม่ใช่ตอน build
- [x] **4. Mutation ผ่าน Server Action** — `actions/rooms.ts` (`createRoom`, `updateRoom`, `deleteRoom`, `createEquipment`, `deleteEquipment`) และ `actions/profile.ts` (`updateProfile`) ตรวจ session, ตรวจ role ใน serializable transaction และ validate ด้วย Zod ซ้ำบน server
- [x] **5. Global state ฝั่ง client** — `context/AuthContext.tsx` (React Context ตามหัวข้อ 5 ของ proposal) layout ฝั่ง server อ่าน session แล้วส่งให้ `AuthProvider` `Navigation` เรียก `useAuth()` โดยไม่ต้องส่ง props ค่านี้ใช้แสดงผลเท่านั้น Server Action ตรวจสิทธิ์จริงบน server เสมอ (ดู `docs/room-integration.md` สำหรับจุดเชื่อมกับ session ของ Folk)
- [x] **6. ฟอร์มที่ validate จริง (react-hook-form + zod)** — `profile-form.tsx` กับ `schemas/profile.ts`, `room-form.tsx` กับ `schemas/room.ts` ใช้ `zodResolver` แสดง error รายช่อง และ schema ชุดเดียวกันถูกใช้ตรวจซ้ำใน Server Action
