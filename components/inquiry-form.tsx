"use client";

import { FormEvent, useState } from "react";
import { wilayas } from "@/lib/wilayas";


export function InquiryForm({ vehicleId, vehicleLabel }: { vehicleId?: string; vehicleLabel?: string }) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [reference, setReference] = useState("");
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); setBusy(true); setError("");
    const formElement = event.currentTarget;
    const form = new FormData(formElement);
    try {
      const response = await fetch("/api/inquiries", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ customerName: form.get("customerName"), phone: form.get("phone"), wilaya: form.get("wilaya"), message: form.get("message"), vehicleId, consent: form.get("consent") === "on", website: form.get("website") }) });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "تعذر إرسال الطلب. حاول مرة أخرى.");
      setReference(data.referenceCode);
      formElement.reset();
    } catch (issue) { setError(issue instanceof Error ? issue.message : "تعذر إرسال الطلب."); }
    finally { setBusy(false); }
  }
  if (reference) return <div className="inquiry-success"><h3>تم إرسال طلبك بنجاح</h3><p>احتفظ برقم المتابعة للرجوع إلى حالة طلبك.</p><strong>{reference}</strong><a href={`/inquiry/${reference}`}>متابعة الطلب ←</a></div>;
  return <form className="inquiry-form" onSubmit={submit}>
    {vehicleLabel && <p className="inquiry-selected-car">السيارة: <b>{vehicleLabel}</b></p>}
    <div className="inquiry-fields"><label>الاسم الكامل<input name="customerName" required maxLength={100} autoComplete="name" /></label><label>رقم الهاتف<input name="phone" required type="tel" inputMode="tel" maxLength={24} autoComplete="tel" placeholder="05 xx xx xx xx" /></label><label>الولاية<select name="wilaya" required defaultValue=""><option value="" disabled>اختر ولايتك</option>{wilayas.map((name,index)=><option value={name} key={name}>{String(index+1).padStart(2,"0")} · {name}</option>)}</select></label><label className="inquiry-wide">رسالة إضافية (اختياري)<textarea name="message" rows={4} maxLength={1500} /></label></div>
    <label className="inquiry-consent"><input name="consent" type="checkbox" required /> أوافق على استخدام بياناتي للتواصل بشأن هذا الطلب فقط.</label>
    <label className="inquiry-trap" aria-hidden="true">اترك هذا الحقل فارغاً<input tabIndex={-1} autoComplete="off" name="website" /></label>
    {error && <p className="auth-error" role="alert">{error}</p>}<button className="gold-button" disabled={busy}>{busy ? "جارٍ الإرسال…" : "إرسال طلب التواصل"}</button>
  </form>;
}
