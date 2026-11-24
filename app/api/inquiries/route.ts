import { NextRequest, NextResponse } from "next/server";
import { createSupabaseAdmin } from "@/lib/supabase-admin";
import { wilayas } from "@/lib/wilayas";

const recent = new Map<string, number[]>();
const phonePattern = /^(?:\+?213|0)(?:5|6|7)\d{8}$/;

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    if (typeof body.website === "string" && body.website.trim()) return NextResponse.json({ success: true });
    const name = String(body.customerName || "").trim();
    const phone = String(body.phone || "").replace(/[\s().-]/g, "");
    const wilaya = String(body.wilaya || "").trim();
    const message = String(body.message || "").trim();
    if (name.length < 2 || name.length > 100 || !phonePattern.test(phone) || !wilayas.includes(wilaya) || message.length > 1500 || body.consent !== true) {
      return NextResponse.json({ error: "تحقق من الاسم ورقم الهاتف والولاية، ووافق على استخدام بيانات الطلب." }, { status: 400 });
    }
    const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
    const now = Date.now();
    const recentRequests = (recent.get(ip) || []).filter((time) => now - time < 60 * 60 * 1000);
    if (recentRequests.length >= 8) return NextResponse.json({ error: "وصلت طلبات كثيرة من هذا الاتصال. حاول بعد قليل." }, { status: 429 });
    recent.set(ip, [...recentRequests, now]);
    const admin = createSupabaseAdmin();
    let vehicleId: string | null = null;
    if (body.vehicleId) {
      const { data: vehicle } = await admin.from("vehicles").select("id").eq("id", String(body.vehicleId)).eq("status", "available").maybeSingle();
      if (!vehicle) return NextResponse.json({ error: "هذه السيارة لم تعد متاحة. حدّث الصفحة وحاول مجدداً." }, { status: 400 });
      vehicleId = vehicle.id;
    }
    const { data, error } = await admin.from("inquiries").insert({ customer_name: name, phone, wilaya, message: message || null, vehicle_id: vehicleId, consent_at: new Date().toISOString() }).select("reference_code").single();
    if (error) throw error;
    return NextResponse.json({ success: true, referenceCode: data.reference_code }, { status: 201, headers: { "Cache-Control": "no-store" } });
  } catch (error) {
    console.error("Salhi inquiry submission failed", error);
    return NextResponse.json({ error: "تعذر حفظ الطلب الآن. اتصل بالمعرض مباشرة." }, { status: 500 });
  }
}
