import { redirect } from "next/navigation";
import { createServerSupabaseClient } from "@/lib/supabase-server";

export async function requireStaff() {
  const supabase = await createServerSupabaseClient();
  const { data } = await supabase.auth.getClaims();
  const id = data?.claims?.sub;
  if (!id) redirect("/admin/login");
  const { data: profile } = await supabase.from("profiles").select("username,full_name,role,is_active").eq("id", id).maybeSingle();
  if (!profile?.is_active) redirect("/admin/login?error=disabled");
  return profile;
}
