"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Building2,
  Users,
  Plus,
  Edit2,
  Trash2,
  Power,
  Search,
  CheckCircle2,
  AlertCircle,
  X,
  Tv,
  Layers,
} from "lucide-react";
import { Dialog } from "@/components/ui/dialog";
import { useApp } from "@/context/app-context";
import { useToast } from "@/context/toast-context";
import { RoomItem } from "@/lib/mock-data";
import { CodeBadge, EyebrowBadge } from "@/components/ui/badge";

export default function AdminRoomsPage() {
  const { rooms, addRoom, updateRoom, deleteRoom, toggleRoomStatus, bookings } =
    useApp();
  const { toast } = useToast();

  const [searchQuery, setSearchQuery] = useState("");
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingRoom, setEditingRoom] = useState<RoomItem | null>(null);

  // Form states for new/edit room
  const [name, setName] = useState("");
  const [roomCode, setRoomCode] = useState("");
  const [location, setLocation] = useState("");
  const [building, setBuilding] = useState("อาคาร DII");
  const [floor, setFloor] = useState(3);
  const [capacity, setCapacity] = useState(12);
  const [imageUrl, setImageUrl] = useState("");
  const [description, setDescription] = useState("");
  const [equipmentInput, setEquipmentInput] = useState(
    "4K Laser Projector, Wi-Fi 6, Polycom Video",
  );

  const filteredRooms = rooms.filter((r) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      r.name.toLowerCase().includes(q) || r.roomCode.toLowerCase().includes(q)
    );
  });

  const handleOpenAdd = () => {
    setName("");
    setRoomCode(`RM-${Math.floor(100 + Math.random() * 900)}`);
    setLocation("อาคารนวัตกรรมดิจิทัล (DII) ชั้น 3");
    setBuilding("อาคาร DII");
    setFloor(3);
    setCapacity(12);
    setImageUrl(
      "https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=1200&q=80",
    );
    setDescription(
      "ห้องประชุมติดตั้งระบบเทคโนโลยีใหม่ พร้อมจอสัมผัสและเครื่องฟอกอากาศ",
    );
    setEquipmentInput(
      "4K Laser Projector & Screen, High-speed Wi-Fi 6, Polycom Video Conference Bar",
    );
    setEditingRoom(null);
    setIsAddModalOpen(true);
  };

  const handleOpenEdit = (room: RoomItem) => {
    setEditingRoom(room);
    setName(room.name);
    setRoomCode(room.roomCode);
    setLocation(room.location);
    setBuilding(room.building);
    setFloor(room.floor);
    setCapacity(room.capacity);
    setImageUrl(room.imageUrl);
    setDescription(room.description);
    setEquipmentInput(room.equipment.join(", "));
    setIsAddModalOpen(true);
  };

  const handleSaveRoom = (e: React.FormEvent) => {
    e.preventDefault();

    const equipmentList = equipmentInput
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);

    if (editingRoom) {
      updateRoom(editingRoom.id, {
        name,
        roomCode,
        location,
        building,
        floor: Number(floor),
        capacity: Number(capacity),
        imageUrl:
          imageUrl ||
          "https://images.unsplash.com/photo-1517502884422-41eaead166d4?auto=format&fit=crop&w=1200&q=80",
        description,
        equipment: equipmentList,
      });
    } else {
      addRoom({
        name,
        roomCode,
        location,
        building,
        floor: Number(floor),
        capacity: Number(capacity),
        imageUrl:
          imageUrl ||
          "https://images.unsplash.com/photo-1517502884422-41eaead166d4?auto=format&fit=crop&w=1200&q=80",
        galleryImages: [imageUrl],
        description,
        isActive: true,
        isAvailableNow: true,
        equipment: equipmentList,
        features: ["ระบบแสงธรรมชาติ", "เก้าอี้ Ergonomic"],
        rules: ["ดูแลรักษาความสะอาดหลังใช้งาน"],
      });
    }

    setIsAddModalOpen(false);
  };

  const handleDelete = (room: RoomItem) => {
    const hasBookings = bookings.some(
      (b) => b.roomId === room.id && b.status !== "CANCELLED",
    );
    if (hasBookings) {
      toast.error(
        "ไม่สามารถลบห้องนี้ได้",
        `ห้อง "${room.name}" มีประวัติหรือรายการจองที่ค้างอยู่ ไม่สามารถลบตามเงื่อนไข (แนะนำให้เปลี่ยนสถานะเป็นปิดปรับปรุงแทน)`,
      );
      return;
    }
    deleteRoom(room.id);
  };

  return (
    <div className="workspace-page mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Header */}
      <div className="page-heading flex flex-col md:flex-row md:items-end justify-between gap-4 pb-6 border-b border-slate-200">
        <div>
          <EyebrowBadge label="จัดการพื้นที่" className="mb-2" />
          <h1 className="text-3xl font-extrabold tracking-tight text-slate-900">
            จัดการห้องประชุม
          </h1>
          <p className="text-sm text-slate-600 mt-1">
            เพิ่มห้องใหม่ แก้ไขรายละเอียด ปรับปรุงสถานะเปิด/ปิดการใช้งาน
            และจัดการอุปกรณ์
          </p>
        </div>

        <button
          onClick={handleOpenAdd}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-xs transition-all cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>เพิ่มห้องประชุมใหม่</span>
        </button>
      </div>

      {/* Search Bar */}
      <div className="flex items-center justify-between gap-4 p-4 surface-panel rounded-2xl border border-slate-200 bg-white shadow-xs">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
          <input
            type="text"
            placeholder="ค้นหาชื่อห้อง หรือรหัสห้อง..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-xs rounded-xl bg-slate-50 border border-slate-200 focus:outline-none focus:border-blue-600 font-medium"
          />
        </div>
        <div className="text-xs text-slate-500 font-medium">
          จำนวนห้องทั้งหมด: <strong>{rooms.length}</strong> ห้อง
        </div>
      </div>

      {/* Rooms Table */}
      <div className="surface-panel rounded-2xl border border-slate-200 bg-white overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50/80 border-b border-slate-200 text-slate-500 uppercase tracking-wider text-[11px]">
              <tr>
                <th className="py-3 px-4">ห้องประชุม</th>
                <th className="py-3 px-4">สถานที่ & อาคาร</th>
                <th className="py-3 px-4">ความจุ</th>
                <th className="py-3 px-4">อุปกรณ์หลัก</th>
                <th className="py-3 px-4">สถานะ</th>
                <th className="py-3 px-4 text-right">การจัดการ</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {filteredRooms.map((room) => (
                <tr
                  key={room.id}
                  className="hover:bg-slate-50/60 transition-colors"
                >
                  <td className="py-3.5 px-4">
                    <div className="flex items-center gap-3">
                      <img
                        src={room.imageUrl}
                        alt={room.name}
                        className="w-12 h-10 rounded-lg object-cover border border-slate-200"
                      />
                      <div>
                        <div className="font-bold text-slate-900">
                          {room.name}
                        </div>
                        <div className="mt-0.5">
                          <CodeBadge code={room.roomCode} />
                        </div>
                      </div>
                    </div>
                  </td>

                  <td className="py-3.5 px-4">
                    <div>{room.building}</div>
                    <div className="text-slate-400 text-[11px]">
                      ชั้น {room.floor}
                    </div>
                  </td>

                  <td className="py-3.5 px-4 font-semibold text-slate-900">
                    {room.capacity} ที่นั่ง
                  </td>

                  <td className="py-3.5 px-4 max-w-xs">
                    <div className="flex flex-wrap gap-1">
                      {room.equipment.slice(0, 2).map((eq, i) => (
                        <span
                          key={i}
                          className="text-[10px] bg-slate-100 px-1.5 py-0.5 rounded text-slate-600 truncate max-w-[120px]"
                        >
                          {eq}
                        </span>
                      ))}
                      {room.equipment.length > 2 && (
                        <span className="text-[10px] bg-slate-100 px-1 py-0.5 rounded text-slate-400">
                          +{room.equipment.length - 2}
                        </span>
                      )}
                    </div>
                  </td>

                  <td className="py-3.5 px-4">
                    <button
                      onClick={() => toggleRoomStatus(room.id)}
                      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold transition-colors cursor-pointer ${
                        room.isActive
                          ? "bg-blue-50 text-blue-800 border border-blue-200 hover:bg-blue-100"
                          : "bg-amber-50 text-amber-800 border border-amber-200 hover:bg-amber-100"
                      }`}
                      title="คลิกเพื่อสลับสถานะ"
                    >
                      <Power className="w-3 h-3" />
                      <span>
                        {room.isActive ? "เปิดใช้งาน" : "ปิดปรับปรุง"}
                      </span>
                    </button>
                  </td>

                  <td className="py-3.5 px-4 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      <button
                        onClick={() => handleOpenEdit(room)}
                        className="p-1.5 rounded-lg border border-slate-200 hover:bg-slate-100 text-slate-600 transition-colors"
                        title="แก้ไขข้อมูลห้อง"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>

                      <button
                        onClick={() => handleDelete(room)}
                        className="p-1.5 rounded-lg border border-rose-200 hover:bg-rose-50 text-rose-600 transition-colors"
                        title="ลบห้องประชุม"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add / Edit Room Modal */}
      {isAddModalOpen && (
        <Dialog
          title={editingRoom ? "แก้ไขข้อมูลห้อง" : "เพิ่มห้องประชุม"}
          onClose={() => setIsAddModalOpen(false)}
        >
          <div className="space-y-5">
            <form onSubmit={handleSaveRoom} className="space-y-3.5 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label
                    htmlFor="rooms-field-1"
                    className="font-semibold text-slate-700"
                  >
                    ชื่อห้องประชุม
                  </label>
                  <input
                    id="rooms-field-1"
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="เช่น Innovation Lab"
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:border-blue-600"
                  />
                </div>
                <div className="space-y-1">
                  <label
                    htmlFor="rooms-field-2"
                    className="font-semibold text-slate-700"
                  >
                    รหัสห้อง (Code)
                  </label>
                  <input
                    id="rooms-field-2"
                    type="text"
                    required
                    value={roomCode}
                    onChange={(e) => setRoomCode(e.target.value)}
                    placeholder="เช่น DII-302"
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:border-blue-600 font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div className="space-y-1">
                  <label
                    htmlFor="rooms-field-3"
                    className="font-semibold text-slate-700"
                  >
                    อาคาร
                  </label>
                  <input
                    id="rooms-field-3"
                    type="text"
                    required
                    value={building}
                    onChange={(e) => setBuilding(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:border-blue-600"
                  />
                </div>
                <div className="space-y-1">
                  <label
                    htmlFor="rooms-field-4"
                    className="font-semibold text-slate-700"
                  >
                    ชั้น
                  </label>
                  <input
                    id="rooms-field-4"
                    type="number"
                    required
                    value={floor}
                    onChange={(e) => setFloor(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:border-blue-600"
                  />
                </div>
                <div className="space-y-1">
                  <label
                    htmlFor="rooms-field-5"
                    className="font-semibold text-slate-700"
                  >
                    ความจุ (คน)
                  </label>
                  <input
                    id="rooms-field-5"
                    type="number"
                    required
                    value={capacity}
                    onChange={(e) => setCapacity(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:border-blue-600"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label
                  htmlFor="rooms-field-6"
                  className="font-semibold text-slate-700"
                >
                  สถานที่ระบุละเอียด
                </label>
                <input
                  id="rooms-field-6"
                  type="text"
                  required
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="เช่น อาคารนวัตกรรมดิจิทัล (DII) ชั้น 3"
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:border-blue-600"
                />
              </div>

              <div className="space-y-1">
                <label
                  htmlFor="rooms-field-7"
                  className="font-semibold text-slate-700"
                >
                  รูปภาพห้อง (Image URL)
                </label>
                <input
                  id="rooms-field-7"
                  type="url"
                  value={imageUrl}
                  onChange={(e) => setImageUrl(e.target.value)}
                  placeholder="https://images.unsplash.com/..."
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:border-blue-600"
                />
              </div>

              <div className="space-y-1">
                <label
                  htmlFor="rooms-field-8"
                  className="font-semibold text-slate-700"
                >
                  คำอธิบายห้อง
                </label>
                <textarea
                  id="rooms-field-8"
                  rows={2}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:border-blue-600"
                />
              </div>

              <div className="space-y-1">
                <label
                  htmlFor="rooms-field-9"
                  className="font-semibold text-slate-700"
                >
                  อุปกรณ์ในห้อง (คั่นด้วยเครื่องหมายจุลภาค ,)
                </label>
                <input
                  id="rooms-field-9"
                  type="text"
                  value={equipmentInput}
                  onChange={(e) => setEquipmentInput(e.target.value)}
                  placeholder="4K Laser Projector, Wi-Fi 6, Polycom Video"
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:border-blue-600"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-slate-200 font-semibold text-slate-700 hover:bg-slate-50"
                >
                  ยกเลิก
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-slate-900 text-white font-semibold hover:bg-blue-600 transition-colors"
                >
                  บันทึกข้อมูลห้อง
                </button>
              </div>
            </form>
          </div>
        </Dialog>
      )}
    </div>
  );
}
