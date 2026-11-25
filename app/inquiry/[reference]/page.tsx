import { BrandLogo } from "@/components/brand-logo";
import Link from "next/link";
import { notFound } from "next/navigation";
import { createSupabaseAdmin } from "@/lib/supabase-admin";

export const dynamic = "force-dynamic";

const statuses: Record<string, string> = { new: "وصل إلى المعرض", contacted: "تم التواصل معك", closed: "أُغلق الطلب" };

export default async function InquiryStatusPage({ params }: { params: Promise<{ reference: string }> }) {
  const { reference } = await params;
  const admin = createSupabaseAdmin();
  const { data } = await admin.from("inquiries").select("reference_code,status,updated_at,created_at,vehicle:vehicles(brand,model,year)").eq("reference_code", reference.toUpperCase()).maybeSingle();
  if (!data) notFound();
  const vehicle = Array.isArray(data.vehicle) ? data.vehicle[0] : data.vehicle;
  return <main className="saved-page" dir="rtl"><header><Link className="brand" href="/"><BrandLogo /></Link><Link className="saved-back" href="/#contact">العودة إلى الموقع ←</Link></header><section className="reference-card"><p className="eyebrow">متابعة الطلب</p><h1>حالة طلب التواصل</h1><p>رقم المتابعة: <b>{data.reference_code}</b></p><strong>{statuses[data.status] || "قيد المعالجة"}</strong>{vehicle && <p>السيارة: {vehicle.brand} {vehicle.model} · {vehicle.year}</p>}<small>آخر تحديث: {new Intl.DateTimeFormat("ar-DZ", { dateStyle: "medium", timeStyle: "short" }).format(new Date(data.updated_at || data.created_at))}</small><p>للاستفسار المباشر: <a href="tel:+213770272794">0770 27 27 94</a></p></section></main>;
}
