"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import {
  RoomItem,
  BookingItem,
  UserProfile,
  INITIAL_ROOMS,
  INITIAL_BOOKINGS,
  DEMO_USERS,
} from "@/lib/mock-data";
import { useToast } from "./toast-context";

interface AppContextType {
  currentUser: UserProfile;
  setCurrentUser: (user: UserProfile) => void;
  switchRole: (role: "USER" | "ADMIN") => void;
  
  // Rooms
  rooms: RoomItem[];
  getRoomById: (id: string) => RoomItem | undefined;
  addRoom: (room: Omit<RoomItem, "id">) => void;
  updateRoom: (id: string, data: Partial<RoomItem>) => void;
  deleteRoom: (id: string) => void;
  toggleRoomStatus: (id: string) => void;

  // Bookings
  bookings: BookingItem[];
  createBooking: (newBooking: Omit<BookingItem, "id" | "createdAt" | "status">) => BookingItem;
  updateBooking: (id: string, data: Partial<BookingItem>) => void;
  cancelBooking: (id: string, reason?: string) => void;
  reviewBooking: (id: string, status: "APPROVED" | "REJECTED", adminNote?: string) => void;

  // Helper filters
  getUserBookings: (userId?: string) => BookingItem[];
}

const AppContext = createContext<AppContextType | undefined>(undefined);

const STORAGE_KEY_ROOMS = "meetsync_rooms_v1";
const STORAGE_KEY_BOOKINGS = "meetsync_bookings_v1";
const STORAGE_KEY_USER = "meetsync_current_user_v1";

export function AppProvider({ children }: { children: ReactNode }) {
  const { toast } = useToast();
  
  const [currentUser, setCurrentUser] = useState<UserProfile>(DEMO_USERS.user);
  const [rooms, setRooms] = useState<RoomItem[]>(INITIAL_ROOMS);
  const [bookings, setBookings] = useState<BookingItem[]>(INITIAL_BOOKINGS);
  const [isHydrated, setIsHydrated] = useState(false);

  // Initialize from LocalStorage asynchronously to avoid cascading synchronous render in effect
  useEffect(() => {
    const timer = setTimeout(() => {
      try {
        const savedUser = localStorage.getItem(STORAGE_KEY_USER);
        if (savedUser) {
          setCurrentUser(JSON.parse(savedUser));
        }
        const savedRooms = localStorage.getItem(STORAGE_KEY_ROOMS);
        if (savedRooms) {
          setRooms(JSON.parse(savedRooms));
        }
        const savedBookings = localStorage.getItem(STORAGE_KEY_BOOKINGS);
        if (savedBookings) {
          setBookings(JSON.parse(savedBookings));
        }
      } catch {
        // Fallback to default
      }
      setIsHydrated(true);
    }, 0);

    return () => clearTimeout(timer);
  }, []);

  // Sync to LocalStorage on updates
  useEffect(() => {
    if (!isHydrated) return;
    try {
      localStorage.setItem(STORAGE_KEY_USER, JSON.stringify(currentUser));
    } catch {}
  }, [currentUser, isHydrated]);

  useEffect(() => {
    if (!isHydrated) return;
    try {
      localStorage.setItem(STORAGE_KEY_ROOMS, JSON.stringify(rooms));
    } catch {}
  }, [rooms, isHydrated]);

  useEffect(() => {
    if (!isHydrated) return;
    try {
      localStorage.setItem(STORAGE_KEY_BOOKINGS, JSON.stringify(bookings));
    } catch {}
  }, [bookings, isHydrated]);

  const switchRole = (role: "USER" | "ADMIN") => {
    const targetUser = role === "ADMIN" ? DEMO_USERS.admin : DEMO_USERS.user;
    setCurrentUser(targetUser);
    toast.info(
      `สลับสิทธิ์การใช้งานเป็น: ${role === "ADMIN" ? "ผู้ดูแลระบบ (Admin)" : "ผู้ใช้งานทั่วไป (User)"}`,
      `เข้าสู่ระบบในนาม "${targetUser.name}"`
    );
  };

  const getRoomById = (id: string) => {
    return rooms.find((r) => r.id === id);
  };

  const addRoom = (roomData: Omit<RoomItem, "id">) => {
    const newRoom: RoomItem = {
      ...roomData,
      id: `room-${Date.now().toString(36)}`,
    };
    setRooms((prev) => [newRoom, ...prev]);
    toast.success("เพิ่มห้องประชุมสำเร็จ", `ห้อง "${newRoom.name}" ถูกเพิ่มเข้าสู่ระบบแล้ว`);
  };

  const updateRoom = (id: string, data: Partial<RoomItem>) => {
    setRooms((prev) =>
      prev.map((r) => (r.id === id ? { ...r, ...data } : r))
    );
    toast.success("อัปเดตข้อมูลห้องสำเร็จ", "การแก้ไขข้อมูลถูกบันทึกเรียบร้อย");
  };

  const deleteRoom = (id: string) => {
    const roomToDelete = rooms.find((r) => r.id === id);
    setRooms((prev) => prev.filter((r) => r.id !== id));
    toast.warning("ลบห้องประชุมแล้ว", `ห้อง "${roomToDelete?.name || id}" ถูกนำออกจากระบบ`);
  };

  const toggleRoomStatus = (id: string) => {
    setRooms((prev) =>
      prev.map((r) => {
        if (r.id === id) {
          const newStatus = !r.isActive;
          toast.info(
            `เปลี่ยนสถานะห้อง: ${r.name}`,
            newStatus ? "เปิดให้จองใช้งานตามปกติ" : "ปิดปรับปรุงชั่วคราว"
          );
          return { ...r, isActive: newStatus };
        }
        return r;
      })
    );
  };

  const createBooking = (
    newBookingData: Omit<BookingItem, "id" | "createdAt" | "status">
  ): BookingItem => {
    const id = `bk-${new Date().getFullYear()}-${Math.floor(100 + Math.random() * 900)}`;
    const newBooking: BookingItem = {
      ...newBookingData,
      id,
      status: "PENDING",
      createdAt: new Date().toISOString(),
    };

    setBookings((prev) => [newBooking, ...prev]);
    toast.success(
      "ส่งคำขอจองห้องสำเร็จ!",
      `คำขอจอง ${newBooking.roomName} อยู่ระหว่างรอการตรวจสอบจากผู้ดูแลระบบ`
    );
    return newBooking;
  };

  const updateBooking = (id: string, data: Partial<BookingItem>) => {
    setBookings((prev) =>
      prev.map((b) => (b.id === id ? { ...b, ...data } : b))
    );
    toast.success("อัปเดตคำขอจองสำเร็จ", "ข้อมูลการจองได้รับการบันทึก");
  };

  const cancelBooking = (id: string, reason?: string) => {
    setBookings((prev) =>
      prev.map((b) =>
        b.id === id
          ? {
              ...b,
              status: "CANCELLED",
              adminNote: reason ? `ผู้จองยกเลิก: ${reason}` : "ผู้จองยกเลิกคำขอ",
            }
          : b
      )
    );
    toast.warning("ยกเลิกการจองเรียบร้อย", "คำขอจองนี้ถูกยกเลิกแล้ว");
  };

  const reviewBooking = (
    id: string,
    status: "APPROVED" | "REJECTED",
    adminNote?: string
  ) => {
    setBookings((prev) =>
      prev.map((b) =>
        b.id === id
          ? {
              ...b,
              status,
              adminNote: adminNote || (status === "APPROVED" ? "อนุมัติคำขอจองตามระเบียบ" : "ขออภัย ไม่อนุมัติคำขอจอง"),
              reviewedByName: currentUser.name,
            }
          : b
      )
    );

    if (status === "APPROVED") {
      toast.success("อนุมัติการจองแล้ว", `คำขอรหัส #${id} ได้รับการอนุมัติและแจ้งเตือนผู้จองแล้ว`);
    } else {
      toast.error("ปฏิเสธคำขอจอง", `คำขอรหัส #${id} ถูกปฏิเสธ พร้อมบันทึกเหตุผลเรียบร้อย`);
    }
  };

  const getUserBookings = (userId?: string) => {
    const targetId = userId || currentUser.id;
    return bookings.filter((b) => b.userId === targetId);
  };

  return (
    <AppContext.Provider
      value={{
        currentUser,
        setCurrentUser,
        switchRole,
        rooms,
        getRoomById,
        addRoom,
        updateRoom,
        deleteRoom,
        toggleRoomStatus,
        bookings,
        createBooking,
        updateBooking,
        cancelBooking,
        reviewBooking,
        getUserBookings,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error("useApp must be used within an AppProvider");
  }
  return context;
}
