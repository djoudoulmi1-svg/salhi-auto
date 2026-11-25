import { BrandLogo } from "@/components/brand-logo";
import Link from "next/link";
import { requireStaff } from "@/lib/staff-session";
import { IdleSignOut, SignOutButton } from "@/components/admin-session-controls";
import { InquiryManager } from "@/components/inquiry-manager";

export const dynamic = "force-dynamic";

export default async function AdminInquiriesPage() {
  const profile = await requireStaff();
  return <main className="admin-shell" dir="rtl"><IdleSignOut/><aside className="admin-side"><Link className="brand" href="/"><BrandLogo /></Link><p className="admin-label">القائمة الرئيسية</p><Link className="side-link" href="/admin">▦　 نظرة عامة</Link><Link className="side-link" href="/admin/vehicles">▣　 السيارات</Link><Link className="side-link selected" href="/admin/inquiries">✉　 طلبات العملاء</Link>{profile.role === "owner" && <Link className="side-link" href="/admin/staff">♙　 الموظفون والحسابات</Link>}{profile.role === "owner" && <Link className="side-link" href="/admin/settings">⚙　 إعدادات الموقع</Link>}<div className="side-bottom"><span className="avatar">SA</span><span>{profile.full_name || profile.username}<small>{profile.role === "owner" ? "مالك المعرض" : profile.role === "manager" ? "مدير" : "موظف"}</small></span><SignOutButton/></div></aside><section className="admin-main"><header className="admin-header"><div><p className="admin-label">خدمة العملاء</p><h1>طلبات العملاء</h1><p>تابع الطلبات، حدّث حالتها، وأسجل تواصل الفريق مع العميل.</p></div><Link className="outline-button dark-outline" href="/admin">العودة للوحة الإدارة</Link></header><InquiryManager currentUser={profile.id} role={profile.role}/></section></main>;
}
