import { NextResponse, type NextRequest } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase-server";
import { createSupabaseAdmin } from "@/lib/supabase-admin";

export async function POST(request: NextRequest) {
  const auth = await createServerSupabaseClient();
  const { data } = await auth.auth.getClaims();
  const userId = data?.claims?.sub;
  if (!userId) return NextResponse.json({ error: "سجّل الدخول أولاً." }, { status: 401 });
  const admin = createSupabaseAdmin();
  const { data: profile } = await admin.from("profiles").select("role,is_active").eq("id", userId).maybeSingle();
  if (!profile?.is_active || !["owner", "manager"].includes(profile.role)) return NextResponse.json({ error: "لا تملك صلاحية رفع صور السيارات." }, { status: 403 });
  try {
    const form = await request.formData();
    const images = form.getAll("images").filter((value): value is File => value instanceof File);
    if (!images.length || images.length > 40) return NextResponse.json({ error: "اختر صورة واحدة على الأقل، وبحد أقصى 40 صورة في الدفعة." }, { status: 400 });
    for (const image of images) {
      if (!["image/webp", "image/jpeg", "image/png", "image/avif"].includes(image.type) || image.size > 4 * 1024 * 1024) return NextResponse.json({ error: "تعذر قبول الصورة. حد الحجم بعد الضغط 4 ميغابايت للصورة." }, { status: 400 });
    }
    const bucket = "vehicles";
    const existing = await admin.storage.getBucket(bucket);
    if (existing.error) {
      const created = await admin.storage.createBucket(bucket, { public: true, fileSizeLimit: "4MB", allowedMimeTypes: ["image/webp", "image/jpeg", "image/png", "image/avif"] });
      if (created.error) {
        const retry = await admin.storage.getBucket(bucket);
        if (retry.error) throw created.error;
      }
    }
    const urls: string[] = [];
    for (const image of images) {
      const extension = image.type === "image/webp" ? "webp" : image.type === "image/png" ? "png" : image.type === "image/avif" ? "avif" : "jpg";
      const path = `${userId}/${crypto.randomUUID()}.${extension}`;
      const { error } = await admin.storage.from(bucket).upload(path, image, { contentType: image.type, upsert: false });
      if (error) throw error;
      urls.push(admin.storage.from(bucket).getPublicUrl(path).data.publicUrl);
    }
    return NextResponse.json({ urls }, { headers: { "Cache-Control": "private, no-store" } });
  } catch (error) {
    console.error("Salhi vehicle image upload failed", error);
    return NextResponse.json({ error: "تعذر رفع الصور. حاول بصور أصغر أو أعد المحاولة." }, { status: 500 });
  }
}
