import Link from "next/link";
import { redirect } from "next/navigation";
import { requireStaff } from "@/lib/staff-session";
import { IdleSignOut, SignOutButton } from "@/components/admin-session-controls";
import { StaffManager } from "@/components/staff-manager";

export default async function StaffPage() {
  const profile = await requireStaff();
  if (profile.role !== "owner") redirect("/admin");
  return <main className="admin-shell" dir="rtl"><IdleSignOut/><aside className="admin-side"><Link className="brand" href="/"><span className="brand-mark">S</span><span>SALHI <b>AUTO</b><small>لوحة الإدارة</small></span></Link><p className="admin-label">القائمة الرئيسية</p><Link className="side-link" href="/admin">▦　 نظرة عامة</Link><Link className="side-link selected" href="/admin/staff">♙　 الموظفون والحسابات</Link><div className="side-bottom"><span className="avatar">SA</span><span>{profile.full_name || profile.username}<small>مالك المعرض</small></span><SignOutButton/></div></aside><section className="admin-main"><header className="admin-header"><div><p className="admin-label">إدارة الفريق</p><h1>الموظفون والحسابات</h1><p>أنشئ حسابات الدخول وأوقفها أو غيّر كلمات المرور.</p></div><Link className="outline-button dark-outline" href="/admin">العودة للوحة الإدارة</Link></header><div className="demo-note">اسم المستخدم وكلمة المرور فقط؛ لا تُستخدم عناوين بريد الموظفين.</div><StaffManager /></section></main>;
}
