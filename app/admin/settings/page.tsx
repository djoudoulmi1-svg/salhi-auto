import Link from "next/link";
import { redirect } from "next/navigation";
import { requireStaff } from "@/lib/staff-session";
import { IdleSignOut, SignOutButton } from "@/components/admin-session-controls";
import { SiteSettingsForm } from "@/components/site-settings-form";

export const dynamic = "force-dynamic";

export default async function AdminSettingsPage() {
  const profile = await requireStaff();
  if (profile.role !== "owner") redirect("/admin");
  return <main className="admin-shell" dir="rtl"><IdleSignOut/><aside className="admin-side"><Link className="brand" href="/"><img className="brand-logo" src="/salhi-auto-logo.png" alt="SALHI AUTO" /></Link><p className="admin-label">القائمة الرئيسية</p><Link className="side-link" href="/admin">▦　 نظرة عامة</Link><Link className="side-link" href="/admin/vehicles">▣　 السيارات</Link><Link className="side-link" href="/admin/inquiries">✉　 طلبات العملاء</Link>{profile.role === "owner"&&<><Link className="side-link" href="/admin/staff">♙　 الموظفون والحسابات</Link><Link className="side-link selected" href="/admin/settings">⚙　 إعدادات الموقع</Link></>}<div className="side-bottom"><span className="avatar">SA</span><span>{profile.full_name||profile.username}<small>مالك المعرض</small></span><SignOutButton/></div></aside><section className="admin-main"><header className="admin-header"><div><p className="admin-label">إدارة الموقع</p><h1>الإعدادات العامة</h1><p>حدّث بيانات المعرض وروابطه ووصفه لمحركات البحث.</p></div><Link className="outline-button dark-outline" href="/admin">العودة للوحة الإدارة</Link></header><SiteSettingsForm/></section></main>;
}
