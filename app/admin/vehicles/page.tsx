import Link from "next/link";
import { redirect } from "next/navigation";
import { IdleSignOut, SignOutButton } from "@/components/admin-session-controls";
import { VehicleManager } from "@/components/vehicle-manager";
import { requireStaff } from "@/lib/staff-session";

export const dynamic = "force-dynamic";

export default async function VehiclesAdminPage() {
  const profile = await requireStaff();
  if (!["owner", "manager"].includes(profile.role)) redirect("/admin");
  return <main className="admin-shell" dir="rtl"><IdleSignOut/><aside className="admin-side"><Link className="brand" href="/"><span className="brand-mark">S</span><span>SALHI <b>AUTO</b><small>لوحة الإدارة</small></span></Link><p className="admin-label">القائمة الرئيسية</p><Link className="side-link" href="/admin">▦　 نظرة عامة</Link><Link className="side-link selected" href="/admin/vehicles">▣　 السيارات</Link><Link className="side-link" href="/admin#inquiries">✉　 طلبات العملاء</Link>{profile.role === "owner" && <Link className="side-link" href="/admin/staff">♙　 الموظفون والحسابات</Link>}<div className="side-bottom"><span className="avatar">SA</span><span>{profile.full_name || profile.username}<small>{profile.role === "owner" ? "مالك المعرض" : "مدير"}</small></span><SignOutButton/></div></aside><section className="admin-main"><header className="admin-header"><div><p className="admin-label">إدارة المخزون</p><h1>السيارات</h1><p>أضف السيارات الحقيقية للمعرض، وعدّل حالتها واحذفها عند الحاجة.</p></div><Link className="outline-button dark-outline" href="/admin">العودة للوحة الإدارة</Link></header><VehicleManager /></section></main>;
}
