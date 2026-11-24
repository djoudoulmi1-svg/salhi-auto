import { NextResponse, type NextRequest } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase-server";
import { createSupabaseAdmin } from "@/lib/supabase-admin";

async function managerContext() {
  const auth = await createServerSupabaseClient();
  const { data } = await auth.auth.getClaims();
  const userId = data?.claims?.sub;
  if (!userId) return { error: NextResponse.json({ error: "سجّل الدخول أولاً." }, { status: 401 }) };
  const admin = createSupabaseAdmin();
  const { data: profile, error } = await admin.from("profiles").select("role,is_active").eq("id", userId).maybeSingle();
  if (error || !profile?.is_active || !["owner", "manager"].includes(profile.role)) return { error: NextResponse.json({ error: "لا تملك صلاحية إدارة مخزون السيارات." }, { status: 403 }) };
  return { admin };
}

export async function GET() {
  const context = await managerContext();
  if ("error" in context) return context.error;
  const { data, error } = await context.admin.from("vehicles").select("*").order("created_at", { ascending: false });
  if (error) return NextResponse.json({ error: "تعذر تحميل المخزون." }, { status: 500 });
  return NextResponse.json({ vehicles: data }, { headers: { "Cache-Control": "private, no-store" } });
}

export async function POST(request: NextRequest) {
  const context = await managerContext();
  if ("error" in context) return context.error;
  try {
    const body = await request.json();
    const brand = String(body.brand || "").trim().slice(0, 80);
    const model = String(body.model || "").trim().slice(0, 100);
    const year = Number(body.year);
    const price = body.hidePrice || body.price === "" || body.price == null ? null : Number(body.price);
    const images = Array.isArray(body.images) ? body.images.filter((item: unknown) => typeof item === "string" && /^https:\/\//.test(item)).slice(0, 40) : [];
    const features = Array.isArray(body.features) ? body.features.map((item: unknown) => String(item).trim().slice(0, 80)).filter(Boolean).slice(0, 30) : [];
    const description = { ar: String(body.descriptionAr || "").trim().slice(0, 5000), fr: String(body.descriptionFr || "").trim().slice(0, 5000), en: String(body.descriptionEn || "").trim().slice(0, 5000) };
    if (!brand || !model || !Number.isInteger(year) || year < 1950 || year > new Date().getFullYear() + 1 || !description.ar || !images.length || (!body.hidePrice && (!Number.isFinite(price) || price! < 0))) {
      return NextResponse.json({ error: "أكمل الماركة والموديل والسنة والوصف بالعربية والصور والسعر أو اختر إخفاء السعر." }, { status: 400 });
    }
    const cleanSlug = `${brand}-${model}-${year}`.normalize("NFKD").replace(/[\u0300-\u036f]/g, "").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 90);
    const slug = cleanSlug || `vehicle-${crypto.randomUUID().slice(0, 8)}`;
    const mileage = body.mileage === "" || body.mileage == null ? null : Number(body.mileage);
    const discount = body.discountPrice === "" || body.discountPrice == null ? null : Number(body.discountPrice);
    const discountEndsAt = body.discountEndsAt ? new Date(String(body.discountEndsAt)) : null;
    if (discount != null && (!Number.isFinite(discount) || price == null || discount >= price || !discountEndsAt || Number.isNaN(discountEndsAt.getTime()) || discountEndsAt.getTime() <= Date.now())) {
      return NextResponse.json({ error: "أدخل سعراً مخفّضاً أقل من السعر الأصلي وحدد تاريخ انتهاء مستقبلياً." }, { status: 400 });
    }
    const { data, error } = await context.admin.from("vehicles").insert({
      slug, brand, model, year, condition: body.condition === "new" ? "new" : "used", price_dzd: price, hide_price: Boolean(body.hidePrice), status: "available",
      fuel: String(body.fuel || "").trim() || null, transmission: String(body.transmission || "").trim() || null,
      mileage_km: Number.isFinite(mileage) ? mileage : null, engine: String(body.engine || "").trim() || null,
      color: String(body.color || "").trim() || null, description, features, images,
      featured: Boolean(body.featured), discount_price_dzd: Number.isFinite(discount) ? discount : null,
      discount_ends_at: discount == null ? null : discountEndsAt!.toISOString(),
      published_at: new Date().toISOString(),
    }).select("id,slug").single();
    if (error) throw error;
    return NextResponse.json({ success: true, vehicle: data }, { status: 201, headers: { "Cache-Control": "private, no-store" } });
  } catch (error) {
    console.error("Salhi vehicle creation failed", error);
    return NextResponse.json({ error: "تعذر حفظ السيارة. تحقق من بياناتها أو من تكرار رابطها." }, { status: 400 });
  }
}

export async function PATCH(request: NextRequest) {
  const context = await managerContext();
  if ("error" in context) return context.error;
  const body = await request.json();
  const status = body.status;
  if (!body.id || !["available", "reserved", "sold"].includes(status)) return NextResponse.json({ error: "الطلب غير صحيح." }, { status: 400 });
  const { error } = await context.admin.from("vehicles").update({ status, updated_at: new Date().toISOString() }).eq("id", body.id);
  if (error) return NextResponse.json({ error: "تعذر تحديث حالة السيارة." }, { status: 500 });
  return NextResponse.json({ success: true }, { headers: { "Cache-Control": "private, no-store" } });
}

export async function DELETE(request: NextRequest) {
  const context = await managerContext();
  if ("error" in context) return context.error;
  const body = await request.json();
  if (!body.id || body.confirm !== true) return NextResponse.json({ error: "يلزم تأكيد الحذف النهائي." }, { status: 400 });
  const { error } = await context.admin.from("vehicles").delete().eq("id", body.id);
  if (error) return NextResponse.json({ error: "تعذر حذف السيارة." }, { status: 500 });
  return NextResponse.json({ success: true }, { headers: { "Cache-Control": "private, no-store" } });
}
