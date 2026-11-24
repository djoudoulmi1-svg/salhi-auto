import { NextRequest, NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase-server";
import { createSupabaseAdmin } from "@/lib/supabase-admin";

async function staffContext() {
  const auth = await createServerSupabaseClient();
  const { data } = await auth.auth.getClaims();
  const id = data?.claims?.sub;
  if (!id) return { error: NextResponse.json({ error: "سجّل الدخول أولاً." }, { status: 401 }) };
  const admin = createSupabaseAdmin();
  const { data: profile } = await admin.from("profiles").select("id,role,is_active,username,full_name").eq("id", id).maybeSingle();
  if (!profile?.is_active || !["owner", "manager", "employee"].includes(profile.role)) return { error: NextResponse.json({ error: "لا تملك صلاحية طلبات العملاء." }, { status: 403 }) };
  return { admin, profile };
}

export async function GET() {
  const context = await staffContext();
  if ("error" in context) return context.error;
  const cutoff = new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString();
  const [{ data: inquiries, error }, { data: staff }, { data: notes }] = await Promise.all([
    context.admin.from("inquiries").select("id,reference_code,vehicle_id,customer_name,phone,wilaya,message,status,assigned_to,created_at,updated_at,vehicle:vehicles(brand,model,year)").gte("created_at", cutoff).order("created_at", { ascending: false }).limit(200),
    context.admin.from("profiles").select("id,username,full_name,role,is_active").eq("is_active", true).order("full_name"),
    context.admin.from("inquiry_notes").select("id,inquiry_id,author_id,note,created_at,author:profiles(full_name,username)").gte("created_at", cutoff).order("created_at", { ascending: true }),
  ]);
  if (error) return NextResponse.json({ error: "تعذر تحميل طلبات العملاء." }, { status: 500 });
  return NextResponse.json({ inquiries: inquiries || [], staff: staff || [], notes: notes || [] }, { headers: { "Cache-Control": "private, no-store" } });
}

export async function PATCH(request: NextRequest) {
  const context = await staffContext();
  if ("error" in context) return context.error;
  try {
    const body = await request.json();
    if (body.action === "note") {
      const note = String(body.note || "").trim();
      if (!body.inquiryId || note.length < 1 || note.length > 2000) return NextResponse.json({ error: "اكتب ملاحظة لا تتجاوز 2000 حرف." }, { status: 400 });
      const { error } = await context.admin.from("inquiry_notes").insert({ inquiry_id: body.inquiryId, author_id: context.profile.id, note });
      if (error) throw error;
      await context.admin.from("inquiries").update({ updated_at: new Date().toISOString() }).eq("id", body.inquiryId);
      return NextResponse.json({ success: true });
    }
    if (body.action === "delete_note") {
      const { data: note } = await context.admin.from("inquiry_notes").select("id,author_id,inquiry_id").eq("id", body.noteId).maybeSingle();
      if (!note || (note.author_id !== context.profile.id && !["owner", "manager"].includes(context.profile.role))) return NextResponse.json({ error: "لا تملك صلاحية حذف هذه الملاحظة." }, { status: 403 });
      const { error } = await context.admin.from("inquiry_notes").delete().eq("id", note.id);
      if (error) throw error;
      await context.admin.from("inquiries").update({ updated_at: new Date().toISOString() }).eq("id", note.inquiry_id);
      return NextResponse.json({ success: true });
    }
    if (!body.id) return NextResponse.json({ error: "الطلب غير صحيح." }, { status: 400 });
    const update: Record<string, string | null> = {};
    if (body.action === "status" && ["new", "contacted", "closed"].includes(body.status)) update.status = body.status;
    else if (body.action === "assign" && ["owner", "manager"].includes(context.profile.role)) {
      if (body.staffId) { const { data: assignee } = await context.admin.from("profiles").select("id").eq("id", body.staffId).eq("is_active", true).maybeSingle(); if (!assignee) return NextResponse.json({ error: "الموظف غير نشط أو غير موجود." }, { status: 400 }); }
      update.assigned_to = body.staffId || null;
    }
    else return NextResponse.json({ error: "الطلب غير صحيح أو لا تملك صلاحية الإسناد." }, { status: 400 });
    update.updated_at = new Date().toISOString();
    const { error } = await context.admin.from("inquiries").update(update).eq("id", body.id);
    if (error) throw error;
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Salhi inquiry update failed", error);
    return NextResponse.json({ error: "تعذر تحديث الطلب." }, { status: 500 });
  }
}
