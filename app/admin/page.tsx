import { BrandLogo } from "@/components/brand-logo";
import Link from "next/link";
import { requireStaff } from "@/lib/staff-session";
import { createSupabaseAdmin } from "@/lib/supabase-admin";
import { formatDzd } from "@/lib/vehicle-format";
import { IdleSignOut, SignOutButton } from "@/components/admin-session-controls";

export const dynamic = "force-dynamic";

const statusLabel: Record<string, string> = { available: "متاحة", reserved: "محجوزة", sold: "مباعة" };
const statusColor: Record<string, string> = { available: "green", reserved: "amber", sold: "gray" };

export default async function AdminPage() {
  const profile = await requireStaff();
  const admin = createSupabaseAdmin();
  const [{ data: vehicles, error: vehiclesError }, { count: newInquiries, error: inquiriesError }, { count: totalInquiries }, { count: availableCount }, { count: reservedCount }, { count: soldCount }] = await Promise.all([
    admin.from("vehicles").select("id,slug,brand,model,year,price_dzd,hide_price,status,mileage_km,created_at").order("created_at", { ascending: false }).limit(8),
    admin.from("inquiries").select("id", { count: "exact", head: true }).eq("status", "new"),
    admin.from("inquiries").select("id", { count: "exact", head: true }),
    admin.from("vehicles").select("id", { count: "exact", head: true }).eq("status", "available"),
    admin.from("vehicles").select("id", { count: "exact", head: true }).eq("status", "reserved"),
    admin.from("vehicles").select("id", { count: "exact", head: true }).eq("status", "sold"),
  ]);
  if (vehiclesError || inquiriesError) console.error("Salhi admin dashboard data could not be loaded", vehiclesError || inquiriesError);
  const rows = vehicles || [];
  const counts = { available: availableCount || 0, reserved: reservedCount || 0, sold: soldCount || 0 };

  return <main className="admin-shell" dir="rtl"><IdleSignOut/><aside className="admin-side"><Link className="brand" href="/"><BrandLogo /></Link><p className="admin-label">القائمة الرئيسية</p><Link className="side-link selected" href="/admin">▦　 نظرة عامة</Link><Link className="side-link" href="/admin/vehicles">▣　 السيارات</Link><Link className="side-link" href="/admin/inquiries">✉　 طلبات العملاء <i>{newInquiries || 0}</i></Link>{profile.role === "owner" && <Link className="side-link" href="/admin/staff">♙　 الموظفون والحسابات</Link>}{profile.role === "owner" && <Link className="side-link" href="/admin/settings">⚙　 إعدادات الموقع</Link>}<div className="side-bottom"><span className="avatar">SA</span><span>{profile.full_name || profile.username}<small>{profile.role === "owner" ? "مالك المعرض" : profile.role === "manager" ? "مدير" : "موظف"}</small></span><SignOutButton/></div></aside><section className="admin-main"><header className="admin-header"><div><p className="admin-label">إدارة Salhi Auto</p><h1>مرحباً {profile.full_name || profile.username} 👋</h1><p>ملخص السيارات والطلبات المسجلة في النظام.</p></div><div><Link className="gold-button" href="/admin/vehicles">＋　إضافة سيارة</Link><a className="outline-button dark-outline" href="/">↗　عرض الموقع</a></div></header><div className="admin-stats"><article><span>السيارات المتاحة</span><strong>{counts.available}</strong><small>في قاعدة بيانات المخزون</small><b>▣</b></article><article><span>السيارات المحجوزة</span><strong>{counts.reserved}</strong><small>غير ظاهرة للزوار</small><b>◷</b></article><article><span>السيارات المباعة</span><strong>{counts.sold}</strong><small>محفوظة في سجل المعرض</small><b>✓</b></article><article><span>الطلبات الجديدة</span><strong>{newInquiries || 0}</strong><small>من أصل {totalInquiries || 0} طلب</small><b>✉</b></article></div><div className="admin-table-head" id="vehicles"><div><h2>مخزون السيارات</h2><p>السيارات المسجلة فعلياً في قاعدة بيانات المعرض.</p></div><Link href="/admin/vehicles">إدارة المخزون ←</Link></div>{rows.length ? <div className="admin-table-wrap"><table><thead><tr><th>السيارة</th><th>السنة</th><th>السعر</th><th>الحالة</th><th>المسافة</th></tr></thead><tbody>{rows.map((car) => <tr key={car.id}><td><b>{car.brand}</b><small>{car.model}</small></td><td>{car.year}</td><td>{car.hide_price || car.price_dzd == null ? "اتصل لمعرفة السعر" : `${formatDzd(Number(car.price_dzd))} دج`}</td><td><span className={`status ${statusColor[car.status] || "gray"}`}>{statusLabel[car.status] || car.status}</span></td><td>{car.mileage_km == null ? "—" : `${formatDzd(car.mileage_km)} كم`}</td></tr>)}</tbody></table></div> : <div className="admin-empty" id="vehicles"><h2>لا توجد سيارات مسجلة بعد</h2><p>أضف مخزون Salhi Auto الحقيقي ليظهر هنا وعلى الموقع العام.</p><Link href="/admin/vehicles">إضافة أول سيارة ←</Link></div>}<div className="inquiry-preview" id="inquiries"><div><h2>طلبات العملاء</h2><span className="status amber">{newInquiries || 0} جديدة</span></div><p>إجمالي الطلبات المحفوظة: {totalInquiries || 0}</p><Link href="/admin/inquiries">إدارة الطلبات وسجل التواصل ←</Link></div></section></main>;
}
