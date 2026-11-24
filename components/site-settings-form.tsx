"use client";

import { useEffect, useState } from "react";
import type { SiteSettings } from "@/lib/site-settings";

const fields: [keyof SiteSettings,string][] = [["phone","رقم الهاتف"],["whatsapp","رقم واتساب"],["email","البريد الإلكتروني"],["address","عنوان المعرض"],["mapsUrl","رابط الخريطة"],["instagram","رابط Instagram"],["youtube","رابط YouTube"],["tiktok","رابط TikTok"],["seoTitle","عنوان الموقع لمحركات البحث"],["seoDescription","وصف الموقع لمحركات البحث"],["about","نبذة عن المعرض"]];
export function SiteSettingsForm() {
  const [settings,setSettings]=useState<SiteSettings|null>(null); const [error,setError]=useState(""); const [message,setMessage]=useState(""); const [busy,setBusy]=useState(false);
  useEffect(()=>{void fetch("/api/admin/settings",{cache:"no-store"}).then(async r=>{const d=await r.json();if(!r.ok)throw new Error(d.error);setSettings(d.settings);}).catch(e=>setError(e.message||"تعذر تحميل الإعدادات."));},[]);
  if(!settings)return <section className="vehicle-create-card">{error||"جارٍ تحميل الإعدادات…"}</section>;
  return <section className="vehicle-create-card"><p className="eyebrow">هوية المعرض</p><h2>بيانات الموقع والظهور في البحث</h2><p>تظهر هذه البيانات للزوار، ويُستخدم العنوان والوصف في نتائج محركات البحث.</p>{error&&<p className="auth-error">{error}</p>}{message&&<p className="staff-notice">{message}</p>}<form onSubmit={async e=>{e.preventDefault();setBusy(true);setError("");setMessage("");try{const r=await fetch("/api/admin/settings",{method:"PATCH",headers:{"Content-Type":"application/json"},body:JSON.stringify(settings)});const d=await r.json();if(!r.ok)throw new Error(d.error);setMessage("تم حفظ الإعدادات.");}catch(err){setError(err instanceof Error?err.message:"تعذر الحفظ.");}finally{setBusy(false);}}}><div className="vehicle-form-grid">{fields.map(([key,label])=><label className={key==="seoDescription"||key==="about"?"vehicle-span-two":""} key={key}>{label}{key==="about"||key==="seoDescription"?<textarea rows={4} value={settings[key]} onChange={e=>setSettings({...settings,[key]:e.target.value})}/>:<input required value={settings[key]} onChange={e=>setSettings({...settings,[key]:e.target.value})}/>}</label>)}</div><button className="gold-button" disabled={busy}>{busy?"جارٍ الحفظ…":"حفظ الإعدادات"}</button></form></section>;
}
