import { createSupabaseAdmin } from "@/lib/supabase-admin";

export type SiteSettings = { phone: string; whatsapp: string; email: string; address: string; mapsUrl: string; instagram: string; youtube: string; tiktok: string; seoTitle: string; seoDescription: string; about: string };
export const defaultSiteSettings: SiteSettings = { phone: "0770 27 27 94", whatsapp: "0550 50 98 94", email: "contact@salhiauto.com", address: "مديرية الجامعة، شارع أول نوفمبر 1954، ورقلة.", mapsUrl: "https://maps.app.goo.gl/MuJiX69wjf3qUPBg8", instagram: "https://www.instagram.com/salhiautomobiles", youtube: "https://www.youtube.com/@salhiauto", tiktok: "https://tiktok.com/@Salhiauto", seoTitle: "SALHI AUTO | سيارات مختارة في ورقلة", seoDescription: "اكتشف سيارات Salhi Auto المتاحة في ورقلة، الجزائر.", about: "صالحي أوتو معرض سيارات جديدة ومستعملة في ورقلة. نساعدك في الاطلاع على السيارات المتوفرة والتواصل مع فريق المعرض لمعرفة التفاصيل." };

export async function getSiteSettings(): Promise<SiteSettings> {
  try {
    const admin = createSupabaseAdmin();
    const { data, error } = await admin.from("site_settings").select("key,value").in("key", Object.keys(defaultSiteSettings));
    if (error) throw error;
    const values = Object.fromEntries((data || []).map((row) => [row.key, typeof row.value === "string" ? row.value : row.value?.value]));
    return Object.fromEntries(Object.entries(defaultSiteSettings).map(([key, fallback]) => [key, typeof values[key] === "string" && values[key] ? values[key] : fallback])) as SiteSettings;
  } catch (error) { console.error("Salhi site settings could not be loaded", error); return defaultSiteSettings; }
}
