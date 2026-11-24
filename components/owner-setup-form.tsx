"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";

export function OwnerSetupForm() {
  const [token, setToken] = useState("");
  const [username, setUsername] = useState("");
  const [fullName, setFullName] = useState("");
  const [password, setPassword] = useState("");
  const [confirmation, setConfirmation] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); setMessage("");
    if (password !== confirmation) { setMessage("كلمتا المرور غير متطابقتين."); return; }
    setLoading(true);
    try {
      const response = await fetch("/api/setup/owner", { method: "POST", headers: { "Content-Type": "application/json", "x-salhi-setup-token": token }, body: JSON.stringify({ username, fullName, password }) });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || "تعذر إعداد الحساب.");
      setMessage("تم إنشاء حساب المالك. يمكنك الآن تسجيل الدخول باسم المستخدم وكلمة المرور.");
    } catch (error) { setMessage(error instanceof Error ? error.message : "تعذر إنشاء الحساب."); }
    finally { setLoading(false); }
  }

  return <main className="staff-auth-page" dir="rtl"><Link className="brand" href="/"><span className="brand-mark">S</span><span>SALHI <b>AUTO</b><small>إعداد المالك</small></span></Link><section className="staff-auth-card"><p className="eyebrow">إعداد لمرة واحدة</p><h1>إنشاء حساب المالك</h1><p>اختر اسم المستخدم وكلمة المرور. لن نطلب بريداً إلكترونياً.</p><form onSubmit={submit}><label>رمز الإعداد<input type="password" autoComplete="off" required value={token} onChange={(e) => setToken(e.target.value)} /></label><label>اسم المالك<input required maxLength={80} value={fullName} onChange={(e) => setFullName(e.target.value)} /></label><label>اسم المستخدم<input required dir="ltr" minLength={3} maxLength={32} autoComplete="username" value={username} onChange={(e) => setUsername(e.target.value)} /></label><label>كلمة المرور<input required type="password" minLength={10} autoComplete="new-password" value={password} onChange={(e) => setPassword(e.target.value)} /><small>10 أحرف على الأقل.</small></label><label>تأكيد كلمة المرور<input required type="password" minLength={10} autoComplete="new-password" value={confirmation} onChange={(e) => setConfirmation(e.target.value)} /></label>{message && <p className="auth-error" role="status">{message}</p>}<button className="gold-button" disabled={loading}>{loading ? "جارٍ الإنشاء…" : "إنشاء حساب المالك"}</button></form><Link className="auth-home" href="/admin/login">العودة لتسجيل الدخول</Link></section></main>;
}
