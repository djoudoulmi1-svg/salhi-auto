import { NextResponse, type NextRequest } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase-server";
import { createSupabaseAdmin } from "@/lib/supabase-admin";
import { isValidUsername, normalizeUsername, usernameLoginEmail } from "@/lib/staff-auth";

async function ownerContext() {
  const auth = await createServerSupabaseClient();
  const { data } = await auth.auth.getClaims();
  const userId = data?.claims?.sub;
  if (!userId) return { error: NextResponse.json({ error: "سجّل الدخول أولاً." }, { status: 401 }) };
  const admin = createSupabaseAdmin();
  const { data: profile, error } = await admin.from("profiles").select("role,is_active").eq("id", userId).maybeSingle();
  if (error || profile?.role !== "owner" || !profile.is_active) return { error: NextResponse.json({ error: "هذه الصفحة خاصة بمالك المعرض." }, { status: 403 }) };
  return { admin };
}

export async function GET() {
  try {
    const context = await ownerContext();
    if ("error" in context) return context.error;
    const { data, error } = await context.admin.from("profiles").select("username,full_name,role,is_active,created_at").order("created_at", { ascending: false });
    if (error) throw error;
    return NextResponse.json({ staff: data }, { headers: { "Cache-Control": "private, no-store" } });
  } catch (error) {
    console.error("Salhi staff list failed", error);
    return NextResponse.json({ error: "تعذر تحميل قائمة الموظفين." }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  const context = await ownerContext();
  if ("error" in context) return context.error;
  try {
    const body = await request.json();
    const username = normalizeUsername(String(body.username || ""));
    const password = String(body.password || "");
    const fullName = String(body.fullName || "").trim();
    const role = body.role === "manager" ? "manager" : body.role === "employee" ? "employee" : "";
    if (!isValidUsername(username) || password.length < 12 || fullName.length < 2 || fullName.length > 80 || !role) {
      return NextResponse.json({ error: "تحقق من الاسم واسم المستخدم والدور، واستخدم كلمة مرور من 12 حرفاً على الأقل." }, { status: 400 });
    }
    const { data: created, error: createError } = await context.admin.auth.admin.createUser({ email: usernameLoginEmail(username), password, email_confirm: true });
    if (createError || !created.user) throw createError || new Error("تعذر إنشاء الحساب.");
    const { error: profileError } = await context.admin.from("profiles").insert({ id: created.user.id, username, full_name: fullName, role, is_active: true });
    if (profileError) {
      await context.admin.auth.admin.deleteUser(created.user.id);
      throw profileError;
    }
    return NextResponse.json({ success: true }, { headers: { "Cache-Control": "private, no-store" } });
  } catch (error) {
    console.error("Salhi staff creation failed", error);
    const message = error && typeof error === "object" && "code" in error && error.code === "email_exists" ? "اسم المستخدم مستخدم مسبقاً." : "تعذر إنشاء الحساب. تحقق من اسم المستخدم ثم حاول مجدداً.";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}

export async function PATCH(request: NextRequest) {
  const context = await ownerContext();
  if ("error" in context) return context.error;
  try {
    const body = await request.json();
    const username = normalizeUsername(String(body.username || ""));
    if (!isValidUsername(username)) return NextResponse.json({ error: "اسم المستخدم غير صحيح." }, { status: 400 });
    const { data: profile, error } = await context.admin.from("profiles").select("id,role").eq("username", username).maybeSingle();
    if (error || !profile) return NextResponse.json({ error: "لم يُعثر على الحساب." }, { status: 404 });
    if (profile.role === "owner") return NextResponse.json({ error: "لا يمكن تعطيل حساب المالك من هنا." }, { status: 400 });

    if (body.action === "reset_password") {
      const password = String(body.password || "");
      if (password.length < 12) return NextResponse.json({ error: "كلمة المرور يجب أن تحتوي على 12 حرفاً على الأقل." }, { status: 400 });
      const { error: resetError } = await context.admin.auth.admin.updateUserById(profile.id, { password });
      if (resetError) throw resetError;
    } else if (body.action === "set_active" && typeof body.isActive === "boolean") {
      const { error: authUpdateError } = await context.admin.auth.admin.updateUserById(profile.id, { ban_duration: body.isActive ? "none" : "876000h" });
      if (authUpdateError) throw authUpdateError;
      const { error: updateError } = await context.admin.from("profiles").update({ is_active: body.isActive }).eq("id", profile.id);
      if (updateError) {
        await context.admin.auth.admin.updateUserById(profile.id, { ban_duration: body.isActive ? "876000h" : "none" });
        throw updateError;
      }
    } else {
      return NextResponse.json({ error: "الطلب غير صحيح." }, { status: 400 });
    }
    return NextResponse.json({ success: true }, { headers: { "Cache-Control": "private, no-store" } });
  } catch (error) {
    console.error("Salhi staff update failed", error);
    return NextResponse.json({ error: "تعذر تحديث الحساب." }, { status: 500 });
  }
}
