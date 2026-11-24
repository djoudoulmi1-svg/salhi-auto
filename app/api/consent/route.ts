import { NextRequest, NextResponse } from "next/server";
import { createSupabaseAdmin } from "@/lib/supabase-admin";

const limits = new Map<string, number[]>();

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    if (typeof body.analytics !== "boolean" || body.policyVersion !== "1") return NextResponse.json({ error: "اختيار الموافقة غير صحيح." }, { status: 400 });
    const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
    const now = Date.now(); const recent = (limits.get(ip) || []).filter((time) => now-time < 60*60*1000);
    if (recent.length >= 20) return NextResponse.json({ error: "طلبات كثيرة." }, { status: 429 });
    limits.set(ip,[...recent,now]);
    const admin = createSupabaseAdmin();
    const { error } = await admin.from("consent_logs").insert({ analytics_allowed: body.analytics, policy_version: "1" });
    if (error) throw error;
    return NextResponse.json({ success: true }, { headers: { "Cache-Control": "no-store" } });
  } catch (error) {
    console.error("Consent choice could not be recorded", error);
    return NextResponse.json({ error: "تعذر تسجيل اختيار ملفات الارتباط." }, { status: 500 });
  }
}
