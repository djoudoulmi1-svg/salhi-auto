"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase";
import { normalizeUsername, usernameLoginEmail } from "@/lib/staff-auth";

export function AdminLoginForm({ setupRequired = false, reason = "" }: { setupRequired?: boolean; reason?: string }) {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(setupRequired ? "يلزم إعداد اتصال قاعدة البيانات قبل تسجيل الدخول." : reason === "disabled" ? "هذا الحساب موقوف. راجع مالك المعرض." : reason === "idle" ? "انتهت الجلسة بعد 15 دقيقة من عدم النشاط. سجّل الدخول مجدداً." : "");
  const [loading, setLoading] = useState(false);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); setError(""); setLoading(true);
    try {
      const client = createClient();
      const { error: authError } = await client.auth.signInWithPassword({ email: usernameLoginEmail(normalizeUsername(username)), password });
      if (authError) throw new Error("اسم المستخدم أو كلمة المرور غير صحيحة.");
      localStorage.setItem("salhi-auto-admin-last-activity", String(Date.now()));
      router.replace("/admin"); router.refresh();
    } catch (issue) {
      setError(issue instanceof Error ? issue.message : "تعذر تسجيل الدخول. حاول مجدداً.");
    } finally { setLoading(false); }
  }

  return <main className="staff-auth-page" dir="rtl"><Link className="brand" href="/"><img className="brand-logo" src="/salhi-auto-logo.png" alt="SALHI AUTO" /></Link><section className="staff-auth-card"><p className="eyebrow">دخول آمن للفريق</p><h1>تسجيل الدخول</h1><p>استخدم اسم المستخدم وكلمة المرور التي أنشأها مالك المعرض.</p><form onSubmit={submit}><label>اسم المستخدم<input autoComplete="username" dir="ltr" required minLength={3} maxLength={32} value={username} onChange={(event) => setUsername(event.target.value)} placeholder="مثال: ahmed.salhi" /></label><label>كلمة المرور<input autoComplete="current-password" type="password" required value={password} onChange={(event) => setPassword(event.target.value)} placeholder="كلمة المرور" /></label>{error && <p className="auth-error" role="alert">{error}</p>}<button className="gold-button" disabled={loading || setupRequired}>{loading ? "جارٍ التحقق…" : "دخول"}</button></form><Link className="auth-home" href="/admin/setup">إعداد حساب المالك لأول مرة</Link><Link className="auth-home" href="/">العودة إلى الموقع</Link></section><small className="auth-footnote">الحسابات يضيفها المالك. لا نطلب بريداً إلكترونياً من الموظفين.</small></main>;
}
