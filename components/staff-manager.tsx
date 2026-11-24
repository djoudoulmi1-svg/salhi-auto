"use client";

import { FormEvent, useEffect, useState } from "react";

type Staff = { username: string; full_name: string; role: "owner" | "manager" | "employee"; is_active: boolean; created_at: string };

export function StaffManager() {
  const [staff, setStaff] = useState<Staff[]>([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [username, setUsername] = useState("");
  const [fullName, setFullName] = useState("");
  const [role, setRole] = useState<"manager" | "employee">("employee");
  const [password, setPassword] = useState("");
  const [resetFor, setResetFor] = useState("");
  const [resetPassword, setResetPassword] = useState("");

  async function loadStaff() {
    try {
      const response = await fetch("/api/admin/staff", { cache: "no-store" });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || "تعذر تحميل الحسابات.");
      setStaff(result.staff || []);
    } catch (issue) { setError(issue instanceof Error ? issue.message : "تعذر تحميل الحسابات."); }
    finally { setLoading(false); }
  }
  useEffect(() => { void loadStaff(); }, []);

  async function createStaff(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); setBusy(true); setError(""); setNotice("");
    try {
      const response = await fetch("/api/admin/staff", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ username, fullName, role, password }) });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || "تعذر إنشاء الحساب.");
      setUsername(""); setFullName(""); setPassword(""); setNotice("أُنشئ الحساب. أعطِ الموظف اسم المستخدم وكلمة المرور بطريقة آمنة.");
      await loadStaff();
    } catch (issue) { setError(issue instanceof Error ? issue.message : "تعذر إنشاء الحساب."); }
    finally { setBusy(false); }
  }

  async function setActive(person: Staff) {
    setBusy(true); setError(""); setNotice("");
    try {
      const response = await fetch("/api/admin/staff", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ action: "set_active", username: person.username, isActive: !person.is_active }) });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || "تعذر تحديث الحساب.");
      setNotice(person.is_active ? "تم إيقاف الحساب." : "تم تفعيل الحساب."); await loadStaff();
    } catch (issue) { setError(issue instanceof Error ? issue.message : "تعذر تحديث الحساب."); }
    finally { setBusy(false); }
  }

  async function resetStaffPassword(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); setBusy(true); setError(""); setNotice("");
    try {
      const response = await fetch("/api/admin/staff", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ action: "reset_password", username: resetFor, password: resetPassword }) });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || "تعذر تغيير كلمة المرور.");
      setResetFor(""); setResetPassword(""); setNotice("تم تغيير كلمة المرور. أبلغ الموظف بها بطريقة آمنة.");
    } catch (issue) { setError(issue instanceof Error ? issue.message : "تعذر تغيير كلمة المرور."); }
    finally { setBusy(false); }
  }

  return <div className="staff-management"><section className="staff-create-card"><h2>إضافة حساب</h2><p>أنشئ اسم مستخدم وكلمة مرور للموظف. لا حاجة إلى بريد إلكتروني.</p><form onSubmit={createStaff}><label>الاسم الكامل<input required maxLength={80} value={fullName} onChange={(e) => setFullName(e.target.value)} /></label><label>اسم المستخدم<input required minLength={3} maxLength={32} dir="ltr" autoComplete="off" placeholder="مثال: ahmed.salhi" value={username} onChange={(e) => setUsername(e.target.value)} /><small>أحرف إنجليزية وأرقام و . _ -</small></label><label>الصلاحية<select value={role} onChange={(e) => setRole(e.target.value as "manager" | "employee")}><option value="employee">موظف</option><option value="manager">مدير</option></select></label><label>كلمة المرور المؤقتة<input required type="password" minLength={12} autoComplete="new-password" value={password} onChange={(e) => setPassword(e.target.value)} /><small>12 حرفاً على الأقل.</small></label><button className="gold-button" disabled={busy}>{busy ? "جارٍ الحفظ…" : "إنشاء الحساب"}</button></form></section><section className="staff-list-section"><div className="admin-table-head"><div><h2>حسابات الفريق</h2><p>المالك والمديرون والموظفون.</p></div></div>{error && <p className="auth-error" role="alert">{error}</p>}{notice && <p className="staff-notice" role="status">{notice}</p>}{loading ? <p>جارٍ تحميل الحسابات…</p> : <div className="admin-table-wrap"><table><thead><tr><th>الاسم</th><th>اسم المستخدم</th><th>الدور</th><th>الحالة</th><th>إدارة الحساب</th></tr></thead><tbody>{staff.map((person) => <tr key={person.username}><td>{person.full_name}</td><td dir="ltr">{person.username}</td><td>{person.role === "owner" ? "مالك" : person.role === "manager" ? "مدير" : "موظف"}</td><td><span className={`status ${person.is_active ? "green" : "gray"}`}>{person.is_active ? "نشط" : "موقوف"}</span></td><td className="staff-actions">{person.role !== "owner" && <><button disabled={busy} onClick={() => void setActive(person)}>{person.is_active ? "إيقاف" : "تفعيل"}</button><button disabled={busy} onClick={() => { setResetFor(resetFor === person.username ? "" : person.username); setResetPassword(""); }}>تغيير كلمة المرور</button></>}</td></tr>)}</tbody></table></div>}</section>{resetFor && <form className="staff-reset-form" onSubmit={resetStaffPassword}><h3>تعيين كلمة مرور جديدة: <b dir="ltr">{resetFor}</b></h3><label>كلمة المرور الجديدة<input type="password" minLength={12} required autoComplete="new-password" value={resetPassword} onChange={(e) => setResetPassword(e.target.value)} /></label><button className="gold-button" disabled={busy}>حفظ كلمة المرور</button><button type="button" onClick={() => setResetFor("")}>إلغاء</button></form>}</div>;
}
