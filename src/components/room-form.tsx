"use client";

// Client Component: same React Hook Form + Zod pattern as the profile form. Shared roomSchema
// validates in the browser, and createRoom/updateRoom validate again on the server.

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { roomSchema, type RoomInput } from "@/schemas/room";
import { createRoom, updateRoom } from "@/actions/rooms";
import { FieldError } from "@/components/ui";
import type { RoomActionResult } from "@/types/room-actions";

export function RoomForm({ room, equipment }: { room?: RoomInput & { id: string }; equipment: { id: string; name: string }[] }) {
  const router = useRouter();
  const [result, setResult] = useState<RoomActionResult | null>(null);
  const summary = useRef<HTMLDivElement>(null);
  useEffect(() => { if (result) summary.current?.focus(); }, [result]);
  const defaults: RoomInput = room ?? { name: "", location: "", capacity: 1, imageUrl: "", isActive: true, equipmentIds: [] };
  const { register, handleSubmit, setError, reset, formState: { errors, isSubmitting } } = useForm<RoomInput>({ resolver: zodResolver(roomSchema), defaultValues: defaults });
  return <form className="form-stack" noValidate onSubmit={handleSubmit(async values => {
    setResult(null);
    try {
      const next = room ? await updateRoom(room.id, values) : await createRoom(values);
      setResult(next);
      for (const [field, messages] of Object.entries(next.fieldErrors ?? {})) if (field in defaults) setError(field as keyof RoomInput, { message: messages[0] });
      if (next.success) { if (!room) reset(defaults); router.refresh(); }
    } catch { setResult({ success: false, message: "เชื่อมต่อไม่สำเร็จ กรุณาลองใหม่" }); }
  })}>
    {result && <div className={`notice${result.success ? "" : " error"}`} ref={summary} role={result.success ? "status" : "alert"} tabIndex={-1}>{result.message}</div>}
    <div className="form-grid">
      <div className="field"><label htmlFor={`name-${room?.id ?? "new"}`}>ชื่อห้อง</label><input id={`name-${room?.id ?? "new"}`} maxLength={100} aria-invalid={!!errors.name} aria-describedby={`name-error-${room?.id ?? "new"}`} {...register("name")} /><FieldError id={`name-error-${room?.id ?? "new"}`} message={errors.name?.message} /></div>
      <div className="field"><label htmlFor={`location-${room?.id ?? "new"}`}>สถานที่ / อาคาร / ชั้น</label><input id={`location-${room?.id ?? "new"}`} maxLength={200} aria-invalid={!!errors.location} aria-describedby={`location-error-${room?.id ?? "new"}`} {...register("location")} /><FieldError id={`location-error-${room?.id ?? "new"}`} message={errors.location?.message} /></div>
      <div className="field"><label htmlFor={`capacity-${room?.id ?? "new"}`}>ความจุ (คน)</label><input id={`capacity-${room?.id ?? "new"}`} type="number" min="1" max="10000" aria-invalid={!!errors.capacity} aria-describedby={`capacity-error-${room?.id ?? "new"}`} {...register("capacity", { valueAsNumber: true })} /><FieldError id={`capacity-error-${room?.id ?? "new"}`} message={errors.capacity?.message} /></div>
      <div className="field"><label htmlFor={`image-${room?.id ?? "new"}`}>URL รูปภาพหลัก <span className="muted">(ไม่บังคับ)</span></label><input id={`image-${room?.id ?? "new"}`} type="url" maxLength={2048} placeholder="https://…" aria-invalid={!!errors.imageUrl} aria-describedby={`image-error-${room?.id ?? "new"}`} {...register("imageUrl")} /><FieldError id={`image-error-${room?.id ?? "new"}`} message={errors.imageUrl?.message} /></div>
    </div>
    <fieldset><legend>อุปกรณ์ในห้อง</legend><div className="equipment-options">{equipment.map(item => <label key={item.id} className="checkbox-label"><input type="checkbox" value={item.id} {...register("equipmentIds")} />{item.name}</label>)}</div>{!equipment.length && <p className="muted">เพิ่มอุปกรณ์จากส่วนจัดการอุปกรณ์ก่อน</p>}<FieldError id={`equipment-error-${room?.id ?? "new"}`} message={errors.equipmentIds?.message} /></fieldset>
    <label className="checkbox-label"><input type="checkbox" {...register("isActive")} />เปิดใช้งานห้อง ให้ผู้ใช้ส่งคำขอจองใหม่ได้</label>
    <p className="field-hint">ปิดใช้งานห้องจะเก็บการจองเดิมไว้ ไม่ยกเลิกคำขอที่มีอยู่</p>
    <div className="button-row"><button className="button" disabled={isSubmitting}>{isSubmitting ? "กำลังบันทึก…" : room ? "บันทึกข้อมูลห้อง" : "เพิ่มห้องประชุม"}</button></div>
  </form>;
}
