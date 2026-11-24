import { NextRequest, NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase-server";
import { createSupabaseAdmin } from "@/lib/supabase-admin";
import { defaultSiteSettings } from "@/lib/site-settings";

async function ownerContext() {
  const auth = await createServerSupabaseClient();
  const { data } = await auth.auth.getClaims();
  const id = data?.claims?.sub;
  if (!id) return { error: NextResponse.json({ error: "سجّل الدخول أولاً." }, { status: 401 }) };
  const admin = createSupabaseAdmin();
  const { data: profile } = await admin.from("profiles").select("role,is_active").eq("id", id).maybeSingle();
  if (profile?.role !== "owner" || !profile.is_active) return { error: NextResponse.json({ error: "الإعدادات خاصة بمالك المعرض." }, { status: 403 }) };
  return { admin };
}

export async function GET() {
  const context = await ownerContext();
  if ("error" in context) return context.error;
  const { data, error } = await context.admin.from("site_settings").select("key,value").in("key", Object.keys(defaultSiteSettings));
  if (error) return NextResponse.json({ error: "تعذر تحميل الإعدادات." }, { status: 500 });
  const result = Object.fromEntries(Object.entries(defaultSiteSettings).map(([key, fallback]) => [key, (data || []).find((row) => row.key === key)?.value || fallback]));
  return NextResponse.json({ settings: result }, { headers: { "Cache-Control": "private, no-store" } });
}

export async function PATCH(request: NextRequest) {
  const context = await ownerContext();
  if ("error" in context) return context.error;
  try {
    const body = await request.json();
    const rows = Object.entries(defaultSiteSettings).map(([key, fallback]) => {
      const value = String(body[key] ?? fallback).trim();
      if (!value || value.length > 1000) throw new Error("تحقق من الحقول المطلوبة.");
      if (["mapsUrl","instagram","youtube","tiktok"].includes(key) && !/^https:\/\//.test(value)) throw new Error("يجب أن يبدأ رابط الموقع ووسائل التواصل بـ https://");
      return { key, value: JSON.stringify(value), updated_at: new Date().toISOString() };
    });
    const { error } = await context.admin.from("site_settings").upsert(rows, { onConflict: "key" });
    if (error) throw error;
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "تعذر حفظ الإعدادات." }, { status: 400 });
  }
}
