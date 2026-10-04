"use client";

// Client Component: React Hook Form + Zod give instant field validation and keep typed
// input in the browser; the Server Action re-validates because client checks are bypassable.

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { profileSchema, type ProfileInput } from "@/schemas/profile";
import { updateProfile } from "@/actions/profile";
import { FieldError } from "@/components/ui";
import type { RoomActionResult } from "@/types/room-actions";

export function ProfileForm({ user }: { user: ProfileInput }) {
  const router = useRouter();
  const [result, setResult] = useState<RoomActionResult | null>(null);
  const summary = useRef<HTMLDivElement>(null);
  useEffect(() => { if (result) summary.current?.focus(); }, [result]);
  const { register, handleSubmit, setError, formState: { errors, isSubmitting } } = useForm<ProfileInput>({ resolver: zodResolver(profileSchema), defaultValues: user });
  return <form className="form-stack" noValidate onSubmit={handleSubmit(async values => {
    setResult(null);
    try {
      const next = await updateProfile(values);
      setResult(next);
      for (const [field, messages] of Object.entries(next.fieldErrors ?? {})) if (field === "name" || field === "email" || field === "department") setError(field, { message: messages[0] });
      if (next.success) router.refresh();
    } catch { setResult({ success: false, message: "เชื่อมต่อไม่สำเร็จ กรุณาลองใหม่" }); }
  })}>
    {result && <div className={`notice${result.success ? "" : " error"}`} role={result.success ? "status" : "alert"} tabIndex={-1} ref={summary}>{result.message}</div>}
    <div className="field"><label htmlFor="profile-name">ชื่อและนามสกุล</label><input id="profile-name" autoComplete="name" maxLength={100} aria-invalid={!!errors.name} aria-describedby={errors.name ? "name-error" : undefined} {...register("name")} /><FieldError id="name-error" message={errors.name?.message} /></div>
    <div className="field"><label htmlFor="profile-email">อีเมล</label><input id="profile-email" type="email" autoComplete="email" maxLength={254} aria-invalid={!!errors.email} aria-describedby={errors.email ? "email-error" : undefined} {...register("email")} /><FieldError id="email-error" message={errors.email?.message} /></div>
    <div className="field"><label htmlFor="profile-department">หน่วยงาน <span className="muted">(ไม่บังคับ)</span></label><input id="profile-department" autoComplete="organization" maxLength={150} aria-invalid={!!errors.department} aria-describedby={errors.department ? "department-error" : undefined} {...register("department")} /><FieldError id="department-error" message={errors.department?.message} /></div>
    <div className="button-row"><button className="button" disabled={isSubmitting}>{isSubmitting ? "กำลังบันทึก…" : "บันทึกข้อมูลส่วนตัว"}</button></div>
  </form>;
}
