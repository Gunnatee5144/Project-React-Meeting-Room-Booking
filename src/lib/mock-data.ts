export interface EquipmentItem {
  id: string;
  name: string;
  iconName: string;
  category: "display" | "audio" | "facility" | "connectivity";
}

export interface RoomItem {
  id: string;
  name: string;
  roomCode: string;
  location: string;
  building: string;
  floor: number;
  capacity: number;
  imageUrl: string;
  galleryImages: string[];
  description: string;
  isActive: boolean;
  equipment: string[];
  features: string[];
  rules: string[];
  isAvailableNow: boolean;
}

export interface BookingItem {
  id: string;
  roomId: string;
  roomName: string;
  roomLocation: string;
  userId: string;
  userName: string;
  userEmail: string;
  userDepartment: string;
  topic: string;
  description?: string;
  startTime: string; // ISO string
  endTime: string;   // ISO string
  attendeeCount: number;
  status: "PENDING" | "APPROVED" | "REJECTED" | "CANCELLED";
  adminNote?: string;
  reviewedByName?: string;
  createdAt: string;
  equipmentNeeded?: string[];
}

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  role: "USER" | "ADMIN";
  department: string;
  phone: string;
  avatarUrl: string;
  studentId?: string;
}

export const INITIAL_EQUIPMENT: EquipmentItem[] = [
  { id: "eq-1", name: "4K Laser Projector & Screen", iconName: "Projector", category: "display" },
  { id: "eq-2", name: "85\" Interactive Touch Display", iconName: "Tv", category: "display" },
  { id: "eq-3", name: "Polycom Video Conference Bar", iconName: "Video", category: "audio" },
  { id: "eq-4", name: "Ceiling Array Microphones", iconName: "Mic", category: "audio" },
  { id: "eq-5", name: "High-speed Wi-Fi 6", iconName: "Wifi", category: "connectivity" },
  { id: "eq-6", name: "Smart Whiteboard & Digital Markers", iconName: "PenTool", category: "facility" },
  { id: "eq-7", name: "Wireless Presentation System", iconName: "Cast", category: "connectivity" },
  { id: "eq-8", name: "Ergonomic Chairs & Power Sockets", iconName: "Armchair", category: "facility" },
];

export const INITIAL_ROOMS: RoomItem[] = [
  {
    id: "room-101",
    name: "Executive Horizon Boardroom",
    roomCode: "HRZ-101",
    location: "อาคารนวัตกรรมดิจิทัล (DII) ชั้น 4",
    building: "อาคาร DII",
    floor: 4,
    capacity: 24,
    imageUrl: "https://images.unsplash.com/photo-1517502884422-41eaead166d4?auto=format&fit=crop&w=1200&q=80",
    galleryImages: [
      "https://images.unsplash.com/photo-1517502884422-41eaead166d4?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1497215728101-856f4ea42174?auto=format&fit=crop&w=1200&q=80"
    ],
    description: "ห้องประชุมผู้บริหารระดับสูง ตกแต่งสไตล์มินิมอลโมเดิร์น พร้อมระบบประชุมทางไกล 4K Dual Screen ระบบเสียงรอบทิศทาง และระบบไมโครโฟนอาร์เรย์แบบฝังเพดาน",
    isActive: true,
    isAvailableNow: true,
    equipment: [
      "4K Laser Projector & Screen",
      "Polycom Video Conference Bar",
      "Ceiling Array Microphones",
      "High-speed Wi-Fi 6",
      "Wireless Presentation System"
    ],
    features: ["แสงธรรมชาติปรับได้", "ม่านไฟฟ้าพร้อมระบบกันแสง", "โต๊ะประชุมไม้โอ๊คจริง", "เครื่องฟอกอากาศ PM2.5"],
    rules: [
      "กรุณาจองล่วงหน้าอย่างน้อย 24 ชั่วโมง",
      "งดนำอาหารที่มีกลิ่นแรงเข้าห้องประชุม",
      "กรุณาปิดระบบไฟฟ้าและอุปกรณ์ประชุมทุกครั้งหลังเสร็จสิ้น"
    ]
  },
  {
    id: "room-102",
    name: "Agile Brainstorm Studio",
    roomCode: "AGL-102",
    location: "อาคารนวัตกรรมดิจิทัล (DII) ชั้น 3",
    building: "อาคาร DII",
    floor: 3,
    capacity: 12,
    imageUrl: "https://images.unsplash.com/photo-1505409859467-3a796fd5798e?auto=format&fit=crop&w=1200&q=80",
    galleryImages: [
      "https://images.unsplash.com/photo-1505409859467-3a796fd5798e?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1531482615713-2afd69097998?auto=format&fit=crop&w=1200&q=80"
    ],
    description: "พื้นที่ระดมความคิดสร้างสรรค์ ผนังไวท์บอร์ดกระจกเต็มพื้นที่ 3 ด้าน เฟอร์นิเจอร์แบบโมดูลาร์ที่ปรับเปลี่ยนเลย์เอาต์การจัดกลุ่มทำงานได้อิสระ เหมาะสำหรับ Design Sprint & Ideation",
    isActive: true,
    isAvailableNow: true,
    equipment: [
      "85\" Interactive Touch Display",
      "Smart Whiteboard & Digital Markers",
      "High-speed Wi-Fi 6",
      "Ergonomic Chairs & Power Sockets"
    ],
    features: ["ผนังกระจกเขียนได้รอบทิศ", "Post-it Notes & Stationary พร้อมใช้", "เก้าอี้ปรับระดับล้อเลื่อน"],
    rules: [
      "ลบไวท์บอร์ดหลังใช้งานเสร็จสิ้น",
      "จัดวางเก้าอี้และโต๊ะกลับสู่ตำแหน่งเดิม"
    ]
  },
  {
    id: "room-103",
    name: "Nexus Seminar & Training Hall",
    roomCode: "NEX-103",
    location: "อาคารเรียนรวมและศูนย์ประชุม ชั้น 2",
    building: "ศูนย์ประชุม",
    floor: 2,
    capacity: 60,
    imageUrl: "https://images.unsplash.com/photo-1577962917302-cd874c4e31d2?auto=format&fit=crop&w=1200&q=80",
    galleryImages: [
      "https://images.unsplash.com/photo-1577962917302-cd874c4e31d2?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1511578314322-379afb476865?auto=format&fit=crop&w=1200&q=80"
    ],
    description: "ห้องสัมมนาและบรรยายขนาดกลาง ออกแบบอคูสติกป้องกันเสียงสะท้อน พร้อมเวทีและโพเดียมบรรยาย ระบบไมค์ลอยไร้สาย 4 ตัว รองรับการจัดงานอบรม เวิร์กช็อป และการนำเสนอโครงงานวิจัย",
    isActive: true,
    isAvailableNow: false,
    equipment: [
      "4K Laser Projector & Screen",
      "Ceiling Array Microphones",
      "High-speed Wi-Fi 6",
      "Wireless Presentation System"
    ],
    features: ["โพเดียมสปีชพร้อมจอแสดงผล", "ระบบบันทึกเสียงและภาพบรรยาย", "แอร์แยกโซนควบคุมอุณหภูมิ"],
    rules: [
      "ต้องมีอาจารย์ที่ปรึกษาหรือเจ้าหน้าที่รับรองสำหรับการจอง",
      "ห้ามเคลื่อนย้ายโพเดียมและแผงควบคุมระบบเสียงโดยไม่ได้รับอนุญาต"
    ]
  },
  {
    id: "room-104",
    name: "Cybernetics Innovation Lab",
    roomCode: "CYB-104",
    location: "อาคารนวัตกรรมดิจิทัล (DII) ชั้น 5",
    building: "อาคาร DII",
    floor: 5,
    capacity: 16,
    imageUrl: "https://images.unsplash.com/photo-1497366754035-f200968a6e72?auto=format&fit=crop&w=1200&q=80",
    galleryImages: [
      "https://images.unsplash.com/photo-1497366754035-f200968a6e72?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1568992687947-868a62a9f521?auto=format&fit=crop&w=1200&q=80"
    ],
    description: "ห้องแล็บประชุมเชิงปฏิบัติการ พร้อมปลั๊กไฟและสายแลนความเร็วสูงประจำทุกที่นั่ง จอแสดงผลแบบ Dual Ultra-wide สำหรับการสาธิตโค้ดและวิเคราะห์ข้อมูล",
    isActive: true,
    isAvailableNow: true,
    equipment: [
      "85\" Interactive Touch Display",
      "Polycom Video Conference Bar",
      "High-speed Wi-Fi 6",
      "Wireless Presentation System",
      "Ergonomic Chairs & Power Sockets"
    ],
    features: ["Dedicated 1Gbps LAN port ทุกโต๊ะ", "USB-C Fast Charging Station", "แอร์ระบบอินเวอร์เตอร์"],
    rules: [
      "ระวังของเหลวและเครื่องดื่มใกล้แท่นเชื่อมต่ออุปกรณ์ไฟฟ้ารอบโต๊ะ"
    ]
  },
  {
    id: "room-105",
    name: "Focus Pod & Interview Studio",
    roomCode: "POD-105",
    location: "อาคารนวัตกรรมดิจิทัล (DII) ชั้น 2",
    building: "อาคาร DII",
    floor: 2,
    capacity: 6,
    imageUrl: "https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&w=1200&q=80",
    galleryImages: [
      "https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1524758631624-e2822e304c36?auto=format&fit=crop&w=1200&q=80"
    ],
    description: "ห้องประชุมขนาดกะทัดรัดผนังกระจกเก็บเสียง Double Glazed เหมาะสำหรับการสัมภาษณ์งาน การคุยโปรเจกต์กลุ่มย่อย หรือการประชุม Video Call แบบส่วนตัวไร้เสียงรบกวน",
    isActive: true,
    isAvailableNow: true,
    equipment: [
      "85\" Interactive Touch Display",
      "Polycom Video Conference Bar",
      "High-speed Wi-Fi 6"
    ],
    features: ["ผนังกันเสียงระดับสตูดิโอ (STC 45)", "ระบบระบายอากาศอัตโนมัติ", "ไฟปรับอุณหภูมิสีได้ Warm/Cool"],
    rules: [
      "จองใช้งานได้ครั้งละไม่เกิน 3 ชั่วโมง เพื่อกระจายสิทธิ์ให้ผู้ใช้อื่น"
    ]
  },
  {
    id: "room-106",
    name: "Grand Auditorium & Town Hall",
    roomCode: "AUD-106",
    location: "อาคารเรียนรวมและศูนย์ประชุม ชั้น 1",
    building: "ศูนย์ประชุม",
    floor: 1,
    capacity: 120,
    imageUrl: "https://images.unsplash.com/photo-1475721027785-f74eccf877e2?auto=format&fit=crop&w=1200&q=80",
    galleryImages: [
      "https://images.unsplash.com/photo-1475721027785-f74eccf877e2?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1544531585-9847b68c8c86?auto=format&fit=crop&w=1200&q=80"
    ],
    description: "หอประชุมใหญ่สำหรับกิจกรรมระดับสถาบัน การปฐมนิเทศ หรือเวทีแถลงผลงานวิจัยระดับชาติ มีระบบควบคุมแสงสีเสียงระดับมืออาชีพ พร้อมห้องควบคุม Control Booth แยกเป็นสัดส่วน",
    isActive: false, // Under scheduled maintenance
    isAvailableNow: false,
    equipment: [
      "4K Laser Projector & Screen",
      "Ceiling Array Microphones",
      "High-speed Wi-Fi 6",
      "Wireless Presentation System"
    ],
    features: ["ระบบแสงสเตจคอนโทรล", "ห้องสตูดิโอควบคุมด้านหลัง", "ทางลาดสำหรับผู้ใช้ Wheelchair"],
    rules: [
      "ต้องจองล่วงหน้าอย่างน้อย 7 วันทำการ",
      "จำเป็นต้องมีทีมช่างเทคนิคประจำควบคุมระบบ"
    ]
  }
];

export const INITIAL_BOOKINGS: BookingItem[] = [
  {
    id: "bk-2026-001",
    roomId: "room-101",
    roomName: "Executive Horizon Boardroom",
    roomLocation: "อาคารนวัตกรรมดิจิทัล (DII) ชั้น 4",
    userId: "usr-1",
    userName: "กันต์ธีร์ วารีสอาด",
    userEmail: "guntee_w@cmu.ac.th",
    userDepartment: "วิทยาลัยนวัตกรรมดิจิทัล (DII)",
    topic: "ประชุมวางแผนกลยุทธ์โครงงานประจำปี 2026",
    description: "สรุปเป้าหมาย OKR ไตรมาส 4 และพิจารณาจัดสรรงบประมาณโครงการวิจัย",
    startTime: "2026-10-05T09:00:00+07:00",
    endTime: "2026-10-05T12:00:00+07:00",
    attendeeCount: 18,
    status: "APPROVED",
    adminNote: "อนุมัติเรียบร้อย เตรียมทีมงานเซ็ตระบบไมค์โครโฟนล่วงหน้า 15 นาที",
    reviewedByName: "ดร. สมชาย ภัทรเดช (Admin)",
    createdAt: "2026-10-01T14:20:00+07:00",
    equipmentNeeded: ["4K Laser Projector & Screen", "Polycom Video Conference Bar"]
  },
  {
    id: "bk-2026-002",
    roomId: "room-102",
    roomName: "Agile Brainstorm Studio",
    roomLocation: "อาคารนวัตกรรมดิจิทัล (DII) ชั้น 3",
    userId: "usr-2",
    userName: "ศรัณย์ กระจ่างแก้ว",
    userEmail: "saran_k@cmu.ac.th",
    userDepartment: "ภาควิชาวิศวกรรมคอมพิวเตอร์",
    topic: "React & Next.js Design Sprint Workshop",
    description: "ระดมความคิดและออกแบบ Wireframe ระบบ Booking สำหรับงาน Midterm",
    startTime: "2026-10-05T13:30:00+07:00",
    endTime: "2026-10-05T16:30:00+07:00",
    attendeeCount: 10,
    status: "APPROVED",
    adminNote: "เตรียมปากกาไวท์บอร์ดใหม่และ Post-it ให้ครบถ้วนแล้ว",
    reviewedByName: "ดร. สมชาย ภัทรเดช (Admin)",
    createdAt: "2026-10-02T10:15:00+07:00",
    equipmentNeeded: ["Smart Whiteboard & Digital Markers", "85\" Interactive Touch Display"]
  },
  {
    id: "bk-2026-003",
    roomId: "room-104",
    roomName: "Cybernetics Innovation Lab",
    roomLocation: "อาคารนวัตกรรมดิจิทัล (DII) ชั้น 5",
    userId: "usr-3",
    userName: "ณฤกส ปันด้วง",
    userEmail: "naruekhet_p@cmu.ac.th",
    userDepartment: "วิทยาลัยนวัตกรรมดิจิทัล (DII)",
    topic: "ประชุมวางแผนงานวิจัยประจำภาคการศึกษา",
    description: "หารือกำหนดหัวข้อวิจัย แบ่งหน้าที่ และวางแผนเก็บข้อมูลร่วมกับทีม",
    startTime: "2026-10-06T10:00:00+07:00",
    endTime: "2026-10-06T12:00:00+07:00",
    attendeeCount: 8,
    status: "PENDING",
    adminNote: "อยู่ระหว่างตรวจสอบตารางซ้อนทับกับกิจกรรมสาขา",
    createdAt: "2026-10-04T08:30:00+07:00",
    equipmentNeeded: ["High-speed Wi-Fi 6", "Ergonomic Chairs & Power Sockets"]
  },
  {
    id: "bk-2026-004",
    roomId: "room-105",
    roomName: "Focus Pod & Interview Studio",
    roomLocation: "อาคารนวัตกรรมดิจิทัล (DII) ชั้น 2",
    userId: "usr-1",
    userName: "กันต์ธีร์ วารีสอาด",
    userEmail: "guntee_w@cmu.ac.th",
    userDepartment: "วิทยาลัยนวัตกรรมดิจิทัล (DII)",
    topic: "สัมภาษณ์รับนักศึกษาช่วยงานวิจัย AI Assistant",
    description: "สัมภาษณ์แบบตัวต่อตัวผ่าน Zoom Conference กับทีมจากต่างประเทศ",
    startTime: "2026-10-07T14:00:00+07:00",
    endTime: "2026-10-07T15:30:00+07:00",
    attendeeCount: 3,
    status: "PENDING",
    createdAt: "2026-10-04T09:45:00+07:00",
    equipmentNeeded: ["Polycom Video Conference Bar"]
  },
  {
    id: "bk-2026-005",
    roomId: "room-103",
    roomName: "Nexus Seminar & Training Hall",
    roomLocation: "อาคารเรียนรวมและศูนย์ประชุม ชั้น 2",
    userId: "usr-4",
    userName: "อาจารย์กิตติศักดิ์ พัฒนสุข",
    userEmail: "kittisak_p@cmu.ac.th",
    userDepartment: "สำนักบริการเทคโนโลยีสารสนเทศ",
    topic: "บรรยายพิเศษ: Cloud-Native Architecture with PostgreSQL",
    description: "บรรยายแก่นักศึกษาชั้นปีที่ 3-4 มีผู้ลงทะเบียนล่วงหน้า 50 คน",
    startTime: "2026-10-08T09:00:00+07:00",
    endTime: "2026-10-08T12:00:00+07:00",
    attendeeCount: 52,
    status: "APPROVED",
    adminNote: "จัดเตรียมไมค์ลอย 3 ตัว พร้อมช่างภาพนิ่งประจำงาน",
    reviewedByName: "ดร. สมชาย ภัทรเดช (Admin)",
    createdAt: "2026-09-28T11:00:00+07:00",
    equipmentNeeded: ["4K Laser Projector & Screen", "Ceiling Array Microphones"]
  },
  {
    id: "bk-2026-006",
    roomId: "room-101",
    roomName: "Executive Horizon Boardroom",
    roomLocation: "อาคารนวัตกรรมดิจิทัล (DII) ชั้น 4",
    userId: "usr-5",
    userName: "พัชราภรณ์ วงศ์สว่าง",
    userEmail: "patcharaporn_w@cmu.ac.th",
    userDepartment: "กองวิเทศสัมพันธ์",
    topic: "การประชุมหารือความร่วมมือมหาวิทยาลัยคู่สัญญา",
    description: "ขอใช้ห้องในวันหยุดราชการเนื่องจากเวลา Timezone ของประเทศคู่เจรจา",
    startTime: "2026-09-29T13:00:00+07:00",
    endTime: "2026-09-29T15:00:00+07:00",
    attendeeCount: 8,
    status: "REJECTED",
    adminNote: "ขออภัย ในช่วงเวลาดังกล่าวอาคารปิดระบบปรับอากาศหลักตามมาตรการประหยัดพลังงาน",
    reviewedByName: "ดร. สมชาย ภัทรเดช (Admin)",
    createdAt: "2026-09-25T16:00:00+07:00"
  }
];

export const DEMO_USERS: Record<string, UserProfile> = {
  user: {
    id: "usr-1",
    name: "กันต์ธีร์ วารีสอาด",
    email: "guntee_w@cmu.ac.th",
    role: "USER",
    department: "วิทยาลัยนวัตกรรมดิจิทัล (DII)",
    phone: "089-123-4567",
    avatarUrl: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80",
    studentId: "682110161"
  },
  admin: {
    id: "usr-admin",
    name: "ดร. สมชาย ภัทรเดช (Admin)",
    email: "admin.meeting@cmu.ac.th",
    role: "ADMIN",
    department: "ศูนย์เทคโนโลยีและบริหารอาคารกลาง",
    phone: "053-941-234",
    avatarUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80"
  }
};
