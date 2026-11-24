import { NextResponse, type NextRequest } from "next/server";
import { createHash, timingSafeEqual } from "node:crypto";
import { createSupabaseAdmin } from "@/lib/supabase-admin";
import { isValidUsername, normalizeUsername, usernameLoginEmail } from "@/lib/staff-auth";

export async function POST(request: NextRequest) {
  const token = request.headers.get("x-salhi-setup-token") || "";
  const expected = process.env.SALHI_SETUP_TOKEN || "";
  if (!expected || expected.length < 32 || !timingSafeEqual(createHash("sha256").update(token).digest(), createHash("sha256").update(expected).digest())) {
    return NextResponse.json({ error: "رمز الإعداد غير صحيح." }, { status: 401 });
  }

  try {
    const body = await request.json();
    const username = normalizeUsername(String(body.username || ""));
    const password = String(body.password || "");
    const fullName = String(body.fullName || "").trim();
    if (!isValidUsername(username) || password.length < 10 || fullName.length < 2 || fullName.length > 80) {
      return NextResponse.json({ error: "أدخل اسم مستخدم صحيحاً (3 أحرف على الأقل)، وكلمة مرور من 10 أحرف، والاسم الكامل." }, { status: 400 });
    }

    const admin = createSupabaseAdmin();
    const { data: owner, error: lookupError } = await admin.from("profiles").select("id").eq("role", "owner").limit(1).maybeSingle();
    if (lookupError) throw lookupError;
    if (owner) return NextResponse.json({ error: "تم إنشاء حساب المالك مسبقاً." }, { status: 409 });

    const { data: created, error: createError } = await admin.auth.admin.createUser({ email: usernameLoginEmail(username), password, email_confirm: true });
    if (createError || !created.user) throw createError || new Error("تعذر إنشاء الحساب.");
    const { error: profileError } = await admin.from("profiles").insert({ id: created.user.id, username, full_name: fullName, role: "owner", is_active: true });
    if (profileError) {
      await admin.auth.admin.deleteUser(created.user.id);
      throw profileError;
    }
    return NextResponse.json({ success: true }, { headers: { "Cache-Control": "private, no-store" } });
  } catch (error) {
    console.error("Salhi owner setup failed", error);
    return NextResponse.json({ error: "تعذر إنشاء المالك. تأكد من إعداد قاعدة البيانات." }, { status: 500, headers: { "Cache-Control": "private, no-store" } });
  }
}
