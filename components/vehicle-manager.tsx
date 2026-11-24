"use client";

import { ChangeEvent, FormEvent, useEffect, useState } from "react";
import { formatDzd } from "@/lib/vehicle-format";

type Row = { id: string; slug: string; brand: string; model: string; year: number; price_dzd: number | null; hide_price: boolean; status: string; mileage_km: number | null };
type Form = { brand: string; model: string; year: string; condition: string; price: string; hidePrice: boolean; mileage: string; fuel: string; transmission: string; engine: string; color: string; descriptionAr: string; descriptionFr: string; descriptionEn: string; features: string; featured: boolean; discountPrice: string; discountEndsAt: string };
const blank: Form = { brand: "", model: "", year: String(new Date().getFullYear()), condition: "used", price: "", hidePrice: false, mileage: "", fuel: "", transmission: "", engine: "", color: "", descriptionAr: "", descriptionFr: "", descriptionEn: "", features: "", featured: false, discountPrice: "", discountEndsAt: "" };

async function compressImage(file: File) {
  if (!file.type.startsWith("image/")) return file;
  try {
    const bitmap = await createImageBitmap(file);
    const scale = Math.min(1, 1920 / Math.max(bitmap.width, bitmap.height));
    const canvas = document.createElement("canvas");
    canvas.width = Math.round(bitmap.width * scale);
    canvas.height = Math.round(bitmap.height * scale);
    const context = canvas.getContext("2d");
    if (!context) return file;
    context.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
    bitmap.close();
    const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, "image/webp", 0.82));
    if (!blob) return file;
    return new File([blob], file.name.replace(/\.[^.]+$/, ".webp"), { type: "image/webp", lastModified: Date.now() });
  } catch { return file; }
}

export function VehicleManager() {
  const [vehicles, setVehicles] = useState<Row[]>([]);
  const [form, setForm] = useState<Form>(blank);
  const [files, setFiles] = useState<File[]>([]);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [imagesLoading, setImagesLoading] = useState(false);

  async function load() {
    try {
      const response = await fetch("/api/admin/vehicles", { cache: "no-store" });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "تعذر تحميل المخزون.");
      setVehicles(data.vehicles || []);
    } catch (issue) { setError(issue instanceof Error ? issue.message : "تعذر تحميل المخزون."); }
  }
  useEffect(() => { void load(); }, []);
  const update = (key: keyof Form, value: string | boolean) => setForm((current) => ({ ...current, [key]: value }));
  const chooseImages = (event: ChangeEvent<HTMLInputElement>) => {
    const selected = Array.from(event.target.files || []);
    setFiles((current) => [...current, ...selected]);
    event.target.value = "";
  };
  const moveImage = (index: number, offset: number) => setFiles((current) => {
    const target = index + offset;
    if (target < 0 || target >= current.length) return current;
    const next = [...current];
    [next[index], next[target]] = [next[target], next[index]];
    return next;
  });

  async function uploadImages() {
    if (!files.length) return [] as string[];
    setImagesLoading(true);
    const urls: string[] = [];
    for (const original of files) {
      const file = await compressImage(original);
      if (file.size > 4 * 1024 * 1024) throw new Error(`الصورة ${original.name} كبيرة. قلّل حجمها قبل الرفع.`);
      const body = new FormData(); body.append("images", file);
      const response = await fetch("/api/admin/vehicles/images", { method: "POST", body });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "تعذر رفع الصور.");
      urls.push(...data.urls);
    }
    setImagesLoading(false);
    return urls;
  }

  async function saveVehicle(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); setError(""); setMessage(""); setLoading(true);
    try {
      const images = await uploadImages();
      const response = await fetch("/api/admin/vehicles", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ ...form, images, features: form.features.split(/[\n,،]/).map((item) => item.trim()).filter(Boolean) }) });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "تعذر حفظ السيارة.");
      setForm(blank); setFiles([]); setMessage("تم حفظ السيارة ونشرها في المخزون المتاح.");
      await load();
    } catch (issue) { setError(issue instanceof Error ? issue.message : "تعذر حفظ السيارة."); }
    finally { setLoading(false); setImagesLoading(false); }
  }

  async function updateStatus(vehicle: Row, status: string) {
    setError("");
    const response = await fetch("/api/admin/vehicles", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id: vehicle.id, status }) });
    const data = await response.json();
    if (!response.ok) { setError(data.error || "تعذر تحديث الحالة."); return; }
    setMessage(`تم تحديث حالة ${vehicle.brand} ${vehicle.model}.`); await load();
  }
  async function deleteVehicle(vehicle: Row) {
    if (!window.confirm(`حذف ${vehicle.brand} ${vehicle.model} نهائياً؟ لا يمكن التراجع عن الحذف.`)) return;
    const response = await fetch("/api/admin/vehicles", { method: "DELETE", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id: vehicle.id, confirm: true }) });
    const data = await response.json();
    if (!response.ok) { setError(data.error || "تعذر حذف السيارة."); return; }
    setMessage("تم حذف السيارة نهائياً."); await load();
  }

  return <div className="vehicle-management">
    {message && <p className="staff-notice" role="status">{message}</p>}{error && <p className="auth-error" role="alert">{error}</p>}
    <section className="vehicle-create-card"><p className="eyebrow">مخزون المعرض</p><h2>إضافة سيارة</h2><p>أدخل بيانات السيارة الفعلية. العربية والصورة والسعر أو خيار إخفائه مطلوبة قبل النشر.</p>
      <form onSubmit={saveVehicle}>
        <fieldset><legend>١. المعلومات الأساسية</legend><div className="vehicle-form-grid"><label>العلامة التجارية<input required maxLength={80} value={form.brand} onChange={(e) => update("brand", e.target.value)} /></label><label>الموديل<input required maxLength={100} value={form.model} onChange={(e) => update("model", e.target.value)} /></label><label>سنة الصنع<input required type="number" min="1950" max={new Date().getFullYear() + 1} value={form.year} onChange={(e) => update("year", e.target.value)} /></label><label>حالة السيارة<select value={form.condition} onChange={(e) => update("condition", e.target.value)}><option value="new">جديدة</option><option value="used">مستعملة</option></select></label></div></fieldset>
        <fieldset><legend>٢. المواصفات</legend><div className="vehicle-form-grid"><label>المسافة المقطوعة (كم)<input type="number" min="0" value={form.mileage} onChange={(e) => update("mileage", e.target.value)} /></label><label>المحرك<input value={form.engine} onChange={(e) => update("engine", e.target.value)} placeholder="مثال: 2.0 لتر" /></label><label>نوع الوقود<select value={form.fuel} onChange={(e) => update("fuel", e.target.value)}><option value="">اختر</option><option>بنزين</option><option>ديزل</option><option>كهرباء</option><option>هجين</option></select></label><label>ناقل الحركة<select value={form.transmission} onChange={(e) => update("transmission", e.target.value)}><option value="">اختر</option><option>يدوي</option><option>أوتوماتيكي</option></select></label><label>اللون<input value={form.color} onChange={(e) => update("color", e.target.value)} /></label><label className="vehicle-span-two">التجهيزات، افصل بينها بفاصلة أو سطر جديد<textarea rows={3} value={form.features} onChange={(e) => update("features", e.target.value)} /></label></div></fieldset>
        <fieldset><legend>٣. الصور</legend><label>ارفع صوراً من الهاتف أو الحاسوب<input type="file" accept="image/*" multiple onChange={chooseImages} /></label><p className="vehicle-help">الصورة الأولى هي الصورة الرئيسية. رتّب الصور قبل النشر.</p>{files.length > 0 && <ol className="vehicle-image-list">{files.map((file, index) => <li key={`${file.name}-${index}`}><span>{index === 0 ? "رئيسية · " : ""}{file.name}</span><button type="button" onClick={() => moveImage(index, -1)} disabled={index === 0} aria-label="تحريك الصورة للأعلى">↑</button><button type="button" onClick={() => moveImage(index, 1)} disabled={index === files.length - 1} aria-label="تحريك الصورة للأسفل">↓</button><button type="button" onClick={() => setFiles((current) => current.filter((_, itemIndex) => itemIndex !== index))}>حذف</button></li>)}</ol>}</fieldset>
        <fieldset><legend>٤. السعر والوصف والنشر</legend><div className="vehicle-form-grid"><label className="vehicle-price-check"><input type="checkbox" checked={form.hidePrice} onChange={(e) => update("hidePrice", e.target.checked)} /> إخفاء السعر وعرض «اتصل لمعرفة السعر»</label>{!form.hidePrice && <><label>السعر بالدينار الجزائري<input required type="number" min="0" value={form.price} onChange={(e) => update("price", e.target.value)} /></label><label>سعر التخفيض (اختياري)<input type="number" min="0" value={form.discountPrice} onChange={(e) => update("discountPrice", e.target.value)} /></label>{form.discountPrice && <label>ينتهي التخفيض في<input required type="date" min={new Date().toISOString().slice(0, 10)} value={form.discountEndsAt} onChange={(e) => update("discountEndsAt", e.target.value)} /></label>}</>}<label className="vehicle-feature-check"><input type="checkbox" checked={form.featured} onChange={(e) => update("featured", e.target.checked)} /> إظهارها كسيارة مميزة</label><label className="vehicle-span-two">الوصف بالعربية (مطلوب)<textarea required rows={4} value={form.descriptionAr} onChange={(e) => update("descriptionAr", e.target.value)} /></label><label className="vehicle-span-two">الوصف بالفرنسية (اختياري)<textarea rows={3} value={form.descriptionFr} onChange={(e) => update("descriptionFr", e.target.value)} /></label><label className="vehicle-span-two">الوصف بالإنجليزية (اختياري)<textarea rows={3} value={form.descriptionEn} onChange={(e) => update("descriptionEn", e.target.value)} /></label></div></fieldset>
        <button className="gold-button" disabled={loading || imagesLoading || !files.length}>{loading || imagesLoading ? "جارٍ الحفظ والرفع…" : "نشر السيارة في المخزون"}</button>
      </form>
    </section>
    <section className="vehicle-list-section"><div className="admin-table-head"><div><h2>السيارات المسجلة</h2><p>المباعة والمحجوزة تبقى في لوحة الإدارة وتُخفى عن الزوار.</p></div><span>{vehicles.length} سيارة</span></div>{vehicles.length ? <div className="admin-table-wrap"><table><thead><tr><th>السيارة</th><th>السنة</th><th>السعر</th><th>الحالة</th><th>الحذف</th></tr></thead><tbody>{vehicles.map((vehicle) => <tr key={vehicle.id}><td><b>{vehicle.brand}</b><small>{vehicle.model}</small></td><td>{vehicle.year}</td><td>{vehicle.hide_price || vehicle.price_dzd == null ? "اتصل لمعرفة السعر" : `${formatDzd(Number(vehicle.price_dzd))} دج`}</td><td><select aria-label={`حالة ${vehicle.brand} ${vehicle.model}`} value={vehicle.status} onChange={(e) => void updateStatus(vehicle, e.target.value)}><option value="available">متاحة</option><option value="reserved">محجوزة</option><option value="sold">مباعة</option></select></td><td><button className="vehicle-delete" onClick={() => void deleteVehicle(vehicle)}>حذف نهائي</button></td></tr>)}</tbody></table></div> : <p className="admin-empty">لم تضف سيارات إلى مخزون المعرض بعد.</p>}</section>
  </div>;
}
