"use client";

// Client Components: React Hook Form + Zod give instant field errors and a pending state.
// The Server Actions (loginUser / registerUser) validate again and are the real authority;
// on success they return a safe `redirectTo` and we refresh so the server layout re-reads the new session.

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { loginSchema, registerSchema, type LoginInput, type RegisterInput } from "@/schemas/auth";
import { loginUser, registerUser } from "@/actions/auth";
import { FieldError } from "@/components/ui";
import type { AuthActionResult } from "@/types/auth-actions";

function useResultFocus(result: AuthActionResult | null) {
  const summary = useRef<HTMLDivElement>(null);
  useEffect(() => { if (result) summary.current?.focus(); }, [result]);
  return summary;
}

function ResultNotice({ result, summary }: { result: AuthActionResult | null; summary: React.RefObject<HTMLDivElement | null> }) {
  if (!result) return null;
  return <div className={`notice${result.success ? "" : " error"}`} role={result.success ? "status" : "alert"} tabIndex={-1} ref={summary}>{result.message}</div>;
}

function qs(next?: string) {
  return next ? `?next=${encodeURIComponent(next)}` : "";
}

export function LoginForm({ next }: { next?: string }) {
  const router = useRouter();
  const [result, setResult] = useState<AuthActionResult | null>(null);
  const summary = useResultFocus(result);
  const { register, handleSubmit, setError, formState: { errors, isSubmitting } } = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "" },
  });

  return <form className="form-stack" noValidate onSubmit={handleSubmit(async values => {
    setResult(null);
    try {
      const outcome = await loginUser(values, next);
      setResult(outcome);
      for (const [field, messages] of Object.entries(outcome.fieldErrors ?? {})) {
        if (field === "email" || field === "password") setError(field, { message: messages[0] });
      }
      if (outcome.success && outcome.redirectTo) { router.replace(outcome.redirectTo); router.refresh(); }
    } catch { setResult({ success: false, message: "เชื่อมต่อไม่สำเร็จ กรุณาลองใหม่" }); }
  })}>
    <ResultNotice result={result} summary={summary} />
    <div className="field"><label htmlFor="login-email">อีเมล</label><input id="login-email" type="email" autoComplete="email" placeholder="your.name@cmu.ac.th" maxLength={254} aria-invalid={!!errors.email} aria-describedby={errors.email ? "login-email-error" : undefined} {...register("email")} /><FieldError id="login-email-error" message={errors.email?.message} /></div>
    <div className="field"><label htmlFor="login-password">รหัสผ่าน</label><input id="login-password" type="password" autoComplete="current-password" maxLength={200} aria-invalid={!!errors.password} aria-describedby={errors.password ? "login-password-error" : undefined} {...register("password")} /><FieldError id="login-password-error" message={errors.password?.message} /></div>
    <div className="button-row"><button className="button" disabled={isSubmitting}>{isSubmitting ? "กำลังเข้าสู่ระบบ…" : "เข้าสู่ระบบ"}</button></div>
    <p className="field-hint">ยังไม่มีบัญชี? <Link href={`/register${qs(next)}`}>สมัครสมาชิก</Link></p>
  </form>;
}

export function RegisterForm({ next }: { next?: string }) {
  const router = useRouter();
  const [result, setResult] = useState<AuthActionResult | null>(null);
  const summary = useResultFocus(result);
  const { register, handleSubmit, setError, formState: { errors, isSubmitting } } = useForm<RegisterInput>({
    resolver: zodResolver(registerSchema),
    defaultValues: { name: "", email: "", department: "", password: "", confirmPassword: "" },
  });

  return <form className="form-stack" noValidate onSubmit={handleSubmit(async values => {
    setResult(null);
    try {
      const outcome = await registerUser(values, next);
      setResult(outcome);
      for (const [field, messages] of Object.entries(outcome.fieldErrors ?? {})) {
        if (field === "name" || field === "email" || field === "department" || field === "password" || field === "confirmPassword") setError(field, { message: messages[0] });
      }
      if (outcome.success && outcome.redirectTo) { router.replace(outcome.redirectTo); router.refresh(); }
    } catch { setResult({ success: false, message: "เชื่อมต่อไม่สำเร็จ กรุณาลองใหม่" }); }
  })}>
    <ResultNotice result={result} summary={summary} />
    <div className="field"><label htmlFor="register-name">ชื่อและนามสกุล</label><input id="register-name" autoComplete="name" maxLength={100} aria-invalid={!!errors.name} aria-describedby={errors.name ? "register-name-error" : undefined} {...register("name")} /><FieldError id="register-name-error" message={errors.name?.message} /></div>
    <div className="field"><label htmlFor="register-email">อีเมล</label><input id="register-email" type="email" autoComplete="email" placeholder="your.name@cmu.ac.th" maxLength={254} aria-invalid={!!errors.email} aria-describedby={errors.email ? "register-email-error" : undefined} {...register("email")} /><FieldError id="register-email-error" message={errors.email?.message} /></div>
    <div className="field"><label htmlFor="register-department">หน่วยงาน <span className="muted">(ไม่บังคับ)</span></label><input id="register-department" autoComplete="organization" maxLength={150} aria-invalid={!!errors.department} aria-describedby={errors.department ? "register-department-error" : undefined} {...register("department")} /><FieldError id="register-department-error" message={errors.department?.message} /></div>
    <div className="field"><label htmlFor="register-password">รหัสผ่าน</label><input id="register-password" type="password" autoComplete="new-password" maxLength={72} aria-invalid={!!errors.password} aria-describedby="register-password-hint" {...register("password")} /><p className="field-hint" id="register-password-hint">อย่างน้อย 8 ตัวอักษร มีทั้งตัวอักษรและตัวเลข</p><FieldError id="register-password-error" message={errors.password?.message} /></div>
    <div className="field"><label htmlFor="register-confirm">ยืนยันรหัสผ่าน</label><input id="register-confirm" type="password" autoComplete="new-password" maxLength={72} aria-invalid={!!errors.confirmPassword} aria-describedby={errors.confirmPassword ? "register-confirm-error" : undefined} {...register("confirmPassword")} /><FieldError id="register-confirm-error" message={errors.confirmPassword?.message} /></div>
    <div className="button-row"><button className="button" disabled={isSubmitting}>{isSubmitting ? "กำลังสมัครสมาชิก…" : "สมัครสมาชิก"}</button></div>
    <p className="field-hint">มีบัญชีอยู่แล้ว? <Link href={`/login${qs(next)}`}>เข้าสู่ระบบ</Link></p>
  </form>;
}
