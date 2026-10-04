"use client";

import React, { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";
import {
  Search,
  Filter,
  Users,
  Building2,
  SlidersHorizontal,
  Grid,
  List,
  CheckCircle2,
  XCircle,
  RotateCcw,
  Sparkles,
  ArrowRight,
  Tv,
  Wifi,
  Video,
  Projector,
  Mic,
  ChevronDown,
} from "lucide-react";
import { useApp } from "@/context/app-context";
import { RoomItem } from "@/lib/mock-data";
import { StatusBadge, CodeBadge, EyebrowBadge } from "@/components/ui/badge";

function RoomsContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { rooms } = useApp();

  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState(searchParams.get("q") || "");
  const [selectedBuilding, setSelectedBuilding] = useState(
    searchParams.get("building") || "all",
  );
  const [minCapacity, setMinCapacity] = useState(
    searchParams.get("capacity") || "",
  );
  const [selectedEquipments, setSelectedEquipments] = useState<string[]>(
    searchParams.getAll("equipment") || [],
  );
  const [onlyAvailable, setOnlyAvailable] = useState(
    searchParams.get("available") === "true",
  );

  const equipmentOptions = [
    "4K Laser Projector & Screen",
    '85" Interactive Touch Display',
    "Polycom Video Conference Bar",
    "Ceiling Array Microphones",
    "High-speed Wi-Fi 6",
    "Smart Whiteboard & Digital Markers",
    "Wireless Presentation System",
  ];

  // Sync state to URL
  const updateUrlParams = (updates: {
    q?: string;
    building?: string;
    capacity?: string;
    equipment?: string[];
    available?: boolean;
  }) => {
    const params = new URLSearchParams();
    const q = updates.q !== undefined ? updates.q : searchQuery;
    const b =
      updates.building !== undefined ? updates.building : selectedBuilding;
    const c = updates.capacity !== undefined ? updates.capacity : minCapacity;
    const eq =
      updates.equipment !== undefined ? updates.equipment : selectedEquipments;
    const av =
      updates.available !== undefined ? updates.available : onlyAvailable;

    if (q) params.set("q", q);
    if (b && b !== "all") params.set("building", b);
    if (c) params.set("capacity", c);
    eq.forEach((item) => params.append("equipment", item));
    if (av) params.set("available", "true");

    router.replace(`/rooms?${params.toString()}`);
  };

  const handleSearchChange = (val: string) => {
    setSearchQuery(val);
    updateUrlParams({ q: val });
  };

  const handleBuildingChange = (val: string) => {
    setSelectedBuilding(val);
    updateUrlParams({ building: val });
  };

  const handleCapacityChange = (val: string) => {
    setMinCapacity(val);
    updateUrlParams({ capacity: val });
  };

  const handleEquipmentToggle = (item: string) => {
    const updated = selectedEquipments.includes(item)
      ? selectedEquipments.filter((e) => e !== item)
      : [...selectedEquipments, item];
    setSelectedEquipments(updated);
    updateUrlParams({ equipment: updated });
  };

  const handleAvailableToggle = () => {
    const updated = !onlyAvailable;
    setOnlyAvailable(updated);
    updateUrlParams({ available: updated });
  };

  const handleResetFilters = () => {
    setSearchQuery("");
    setSelectedBuilding("all");
    setMinCapacity("");
    setSelectedEquipments([]);
    setOnlyAvailable(false);
    router.replace("/rooms");
  };

  // Filter computation
  const filteredRooms = rooms.filter((room) => {
    // Search query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchName = room.name.toLowerCase().includes(q);
      const matchCode = room.roomCode.toLowerCase().includes(q);
      const matchLoc = room.location.toLowerCase().includes(q);
      if (!matchName && !matchCode && !matchLoc) return false;
    }

    // Building
    if (selectedBuilding !== "all" && room.building !== selectedBuilding) {
      return false;
    }

    // Capacity
    if (minCapacity && room.capacity < parseInt(minCapacity, 10)) {
      return false;
    }

    // Only Available
    if (onlyAvailable && (!room.isActive || !room.isAvailableNow)) {
      return false;
    }

    // Equipment
    if (selectedEquipments.length > 0) {
      const hasAllEquip = selectedEquipments.every((eq) =>
        room.equipment.includes(eq),
      );
      if (!hasAllEquip) return false;
    }

    return true;
  });

  return (
    <div className="workspace-page mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Header */}
      <div className="page-heading flex flex-col md:flex-row md:items-end justify-between gap-4 pb-6 border-b border-slate-200">
        <div>
          <EyebrowBadge label="ห้องประชุม" className="mb-2" />
          <h1 className="text-3xl font-extrabold tracking-tight text-slate-900">
            ห้องประชุมทั้งหมด
          </h1>
          <p className="text-sm text-slate-600 mt-1">
            ค้นหา ตรวจสอบอุปกรณ์ และจองห้องประชุมที่ตรงกับความต้องการของคุณ
          </p>
        </div>

        {/* View mode toggle & summary counter */}
        <div className="flex items-center gap-3">
          <span className="text-xs text-slate-500 font-medium">
            พบห้องประชุม:{" "}
            <strong className="text-slate-900">{filteredRooms.length}</strong>{" "}
            จาก {rooms.length} ห้อง
          </span>

          <div className="flex items-center border border-slate-200 rounded-lg p-0.5 bg-white">
            <button
              onClick={() => setViewMode("grid")}
              className={`p-1.5 rounded-md ${
                viewMode === "grid"
                  ? "bg-slate-100 text-slate-900"
                  : "text-slate-400 hover:text-slate-700"
              }`}
              aria-label="แสดงแบบตาราง"
              aria-pressed={viewMode === "grid"}
            >
              <Grid className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode("list")}
              className={`p-1.5 rounded-md ${
                viewMode === "list"
                  ? "bg-slate-100 text-slate-900"
                  : "text-slate-400 hover:text-slate-700"
              }`}
              aria-label="แสดงแบบรายการ"
              aria-pressed={viewMode === "list"}
            >
              <List className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Main Layout: Filters Sidebar + Room Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 items-start">
        {/* Filters Sidebar */}
        <aside className="room-filter surface-panel rounded-2xl border border-slate-200 bg-white p-5 shadow-xs space-y-6">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div className="hidden lg:flex items-center gap-2 text-sm font-bold text-slate-900">
              <SlidersHorizontal className="w-4 h-4 text-blue-600" />
              <span>ตัวกรองค้นหา</span>
            </div>
            <button
              type="button"
              onClick={() => setFiltersOpen((open) => !open)}
              aria-expanded={filtersOpen}
              aria-controls="room-search-filters"
              className="flex items-center gap-2 text-sm font-semibold text-blue-700 lg:hidden"
            >
              <SlidersHorizontal className="h-4 w-4" />
              ตัวกรองค้นหา
              <ChevronDown
                className={
                  "h-4 w-4 transition-transform " +
                  (filtersOpen ? "rotate-180" : "")
                }
              />
            </button>
            <button
              onClick={handleResetFilters}
              className="text-xs text-slate-500 hover:text-slate-900 flex items-center gap-1 font-medium transition-colors"
            >
              <RotateCcw className="w-3 h-3" />
              ล้างค่า
            </button>
          </div>

          <div
            id="room-search-filters"
            className={
              "space-y-6 " + (filtersOpen ? "block" : "hidden lg:block")
            }
          >
            {/* Search Keyword */}
            <div className="space-y-2">
              <label
                htmlFor="rooms-field-1"
                className="text-xs font-semibold text-slate-700 uppercase tracking-wider"
              >
                ค้นหาด้วยคำสำคัญ
              </label>
              <div className="relative">
                <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
                <input
                  id="rooms-field-1"
                  type="text"
                  placeholder="ชื่อห้อง, รหัส เช่น HRZ..."
                  value={searchQuery}
                  onChange={(e) => handleSearchChange(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 text-xs rounded-xl bg-slate-50 border border-slate-200 focus:outline-none focus:border-blue-600 focus:bg-white transition-colors"
                />
              </div>
            </div>

            {/* Building Selector */}
            <div className="space-y-2">
              <label
                htmlFor="rooms-field-2"
                className="text-xs font-semibold text-slate-700 uppercase tracking-wider"
              >
                อาคาร / สถานที่
              </label>
              <select
                id="rooms-field-2"
                value={selectedBuilding}
                onChange={(e) => handleBuildingChange(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 border border-slate-200 focus:outline-none focus:border-blue-600 font-medium"
              >
                <option value="all">ทุกอาคาร</option>
                <option value="อาคาร DII">
                  อาคาร DII (วิทยาลัยนวัตกรรมดิจิทัล)
                </option>
                <option value="ศูนย์ประชุม">ศูนย์ประชุม / อาคารเรียนรวม</option>
              </select>
            </div>

            {/* Capacity */}
            <div className="space-y-2">
              <p className="text-xs font-semibold text-slate-700">
                ความจุขั้นต่ำ (ผู้เข้าร่วม)
              </p>
              <div className="grid grid-cols-4 gap-1.5">
                {["", "6", "15", "50"].map((cap) => (
                  <button
                    key={cap}
                    type="button"
                    onClick={() => handleCapacityChange(cap)}
                    aria-pressed={minCapacity === cap}
                    className={`py-1.5 text-xs font-semibold rounded-lg border transition-all ${
                      minCapacity === cap
                        ? "bg-blue-600 text-white border-blue-600"
                        : "bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100"
                    }`}
                  >
                    {cap === "" ? "ทั้งหมด" : `${cap}+`}
                  </button>
                ))}
              </div>
            </div>

            {/* Availability Toggle */}
            <div className="pt-2 border-t border-slate-100">
              <label className="flex items-center gap-2 cursor-pointer text-xs font-medium text-slate-800">
                <input
                  type="checkbox"
                  checked={onlyAvailable}
                  onChange={handleAvailableToggle}
                  className="rounded border-slate-300 text-blue-600 focus:ring-blue-500 w-4 h-4"
                />
                <span>แสดงเฉพาะห้องที่พร้อมใช้งานขณะนี้</span>
              </label>
            </div>

            {/* Equipment Checkboxes */}
            <div className="space-y-2.5 pt-2 border-t border-slate-100">
              <p className="text-xs font-semibold text-slate-700">
                อุปกรณ์จำเป็นในห้อง
              </p>
              <div className="space-y-2">
                {equipmentOptions.map((eq) => (
                  <label
                    key={eq}
                    className="flex items-start gap-2 text-xs text-slate-600 hover:text-slate-900 cursor-pointer"
                  >
                    <input
                      type="checkbox"
                      checked={selectedEquipments.includes(eq)}
                      onChange={() => handleEquipmentToggle(eq)}
                      className="mt-0.5 rounded border-slate-300 text-blue-600 focus:ring-blue-500 w-3.5 h-3.5"
                    />
                    <span className="leading-tight">{eq}</span>
                  </label>
                ))}
              </div>
            </div>
            <button
              type="button"
              onClick={() => setFiltersOpen(false)}
              className="button-primary w-full lg:hidden"
            >
              ดู {filteredRooms.length} ห้อง
            </button>
          </div>
        </aside>

        {/* Rooms Listing */}
        <div className="lg:col-span-3 space-y-6">
          {filteredRooms.length === 0 ? (
            /* Empty State */
            <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-12 text-center space-y-4">
              <div className="w-14 h-14 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
                <Search className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-slate-800">
                ไม่พบห้องประชุมที่ตรงกับเงื่อนไข
              </h3>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                ลองปรับเปลี่ยนคำค้นหา หรือลดตัวกรองอุปกรณ์และความจุ
                เพื่อดูตัวเลือกห้องประชุมอื่นๆ
              </p>
              <button
                onClick={handleResetFilters}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-slate-900 text-white text-xs font-semibold hover:bg-slate-800"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                ล้างตัวกรองทั้งหมด
              </button>
            </div>
          ) : viewMode === "grid" ? (
            /* Grid View */
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {filteredRooms.map((room) => (
                <div
                  key={room.id}
                  className="room-tile group surface-panel rounded-2xl border border-slate-200 bg-white overflow-hidden shadow-xs hover:shadow-lg hover:border-slate-300 transition-all flex flex-col"
                >
                  <div className="room-detail-photo relative aspect-video w-full overflow-hidden bg-slate-100">
                    <img
                      src={room.imageUrl}
                      alt={room.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />

                    <div className="absolute top-3 left-3">
                      <StatusBadge
                        status={room.isActive ? "AVAILABLE" : "MAINTENANCE"}
                        label={room.isActive ? "พร้อมใช้งาน" : "ปิดปรับปรุง"}
                      />
                    </div>

                    <div className="absolute top-3 right-3">
                      <CodeBadge code={room.roomCode} />
                    </div>
                  </div>

                  <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                    <div className="space-y-1.5">
                      <div className="flex items-center gap-1.5 text-xs text-slate-500 font-medium">
                        <Building2 className="w-3.5 h-3.5 text-slate-400" />
                        <span>{room.location}</span>
                      </div>
                      <h3 className="text-base font-bold text-slate-900 group-hover:text-blue-700 transition-colors">
                        <Link href={`/rooms/${room.id}`}>{room.name}</Link>
                      </h3>
                      <p className="text-xs text-slate-600 line-clamp-2">
                        {room.description}
                      </p>
                    </div>

                    <div className="space-y-3 pt-3 border-t border-slate-100">
                      <div className="flex items-center justify-between text-xs">
                        <div className="flex items-center gap-1.5 text-slate-700 font-semibold">
                          <Users className="w-4 h-4 text-blue-600" />
                          <span>รองรับ {room.capacity} ที่นั่ง</span>
                        </div>
                        <span className="text-slate-500 text-[11px]">
                          ชั้น {room.floor}
                        </span>
                      </div>

                      <div className="flex flex-wrap gap-1">
                        {room.equipment.slice(0, 3).map((item, idx) => (
                          <span
                            key={idx}
                            className="px-2 py-0.5 rounded text-[10px] font-medium bg-slate-100 text-slate-700 truncate max-w-[140px]"
                          >
                            {item}
                          </span>
                        ))}
                        {room.equipment.length > 3 && (
                          <span className="px-1.5 py-0.5 rounded text-[10px] font-medium bg-slate-50 text-slate-400">
                            +{room.equipment.length - 3}
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="pt-2 flex items-center gap-2">
                      <Link
                        href={`/rooms/${room.id}`}
                        className="flex-1 py-2 text-center rounded-xl border border-slate-200 hover:bg-slate-50 text-xs font-semibold text-slate-700 transition-colors"
                      >
                        รายละเอียด
                      </Link>
                      <Link
                        href={`/rooms/${room.id}/book`}
                        className={`flex-1 py-2 text-center rounded-xl text-xs font-semibold transition-all ${
                          room.isActive
                            ? "bg-blue-600 hover:bg-blue-700 text-white shadow-xs"
                            : "bg-slate-100 text-slate-400 pointer-events-none"
                        }`}
                      >
                        จองห้องนี้
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            /* List View */
            <div className="space-y-4">
              {filteredRooms.map((room) => (
                <div
                  key={room.id}
                  className="room-tile group surface-panel rounded-2xl border border-slate-200 bg-white p-4 shadow-xs hover:shadow-md transition-all flex flex-col sm:flex-row gap-5 items-center"
                >
                  <div className="relative w-full sm:w-48 aspect-video sm:aspect-square rounded-xl overflow-hidden bg-slate-100 flex-shrink-0">
                    <img
                      src={room.imageUrl}
                      alt={room.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                    />
                    <div className="absolute top-2 left-2">
                      <CodeBadge code={room.roomCode} />
                    </div>
                  </div>

                  <div className="flex-1 space-y-2 w-full">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 text-xs text-slate-500">
                        <Building2 className="w-3.5 h-3.5" />
                        <span>{room.location}</span>
                      </div>
                      <StatusBadge
                        status={room.isActive ? "AVAILABLE" : "MAINTENANCE"}
                        label={room.isActive ? "พร้อมใช้งาน" : "ปิดปรับปรุง"}
                      />
                    </div>

                    <h3 className="text-base font-bold text-slate-900 group-hover:text-blue-700 transition-colors">
                      <Link href={`/rooms/${room.id}`}>{room.name}</Link>
                    </h3>

                    <p className="text-xs text-slate-600 line-clamp-2">
                      {room.description}
                    </p>

                    <div className="flex flex-wrap items-center gap-4 text-xs pt-1">
                      <div className="flex items-center gap-1 text-slate-700 font-semibold">
                        <Users className="w-3.5 h-3.5 text-blue-600" />
                        <span>{room.capacity} ที่นั่ง</span>
                      </div>
                      <div className="text-slate-500">ชั้น {room.floor}</div>
                      <div className="flex flex-wrap gap-1">
                        {room.equipment.slice(0, 3).map((eq, i) => (
                          <span
                            key={i}
                            className="text-[10px] bg-slate-100 text-slate-700 px-1.5 py-0.5 rounded"
                          >
                            {eq}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="flex sm:flex-col gap-2 w-full sm:w-32 flex-shrink-0 pt-2 sm:pt-0">
                    <Link
                      href={`/rooms/${room.id}`}
                      className="flex-1 sm:w-full py-2 text-center rounded-xl border border-slate-200 hover:bg-slate-50 text-xs font-semibold text-slate-700"
                    >
                      รายละเอียด
                    </Link>
                    <Link
                      href={`/rooms/${room.id}/book`}
                      className={`flex-1 sm:w-full py-2 text-center rounded-xl text-xs font-semibold ${
                        room.isActive
                          ? "bg-blue-600 hover:bg-blue-700 text-white"
                          : "bg-slate-100 text-slate-400 pointer-events-none"
                      }`}
                    >
                      จองห้อง
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function RoomsPage() {
  return (
    <Suspense
      fallback={
        <div className="p-12 text-center text-sm text-slate-500">
          กำลังโหลดรายการห้องประชุม...
        </div>
      }
    >
      <RoomsContent />
    </Suspense>
  );
}
