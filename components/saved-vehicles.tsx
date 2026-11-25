"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import type { Vehicle } from "@/lib/vehicles";
import { formatDzd, vehiclePriceLabel } from "@/lib/vehicle-format";

function useSavedCars(key: string, cars: Vehicle[]) {
  const [ids, setIds] = useState<string[]>([]);
  const available = useMemo(() => new Set(cars.map((car) => car.id)), [cars]);
  useEffect(() => {
    try { setIds(JSON.parse(localStorage.getItem(key) || "[]").filter((id: string) => available.has(id))); }
    catch { setIds([]); }
  }, [available, key]);
  useEffect(() => { if (ids.length || localStorage.getItem(key)) localStorage.setItem(key, JSON.stringify(ids.filter((id) => available.has(id)))); }, [available, ids, key]);
  return [ids, setIds] as const;
}

function SavedLayout({ children }: { children: React.ReactNode }) {
  return <main className="saved-page" dir="rtl"><header><Link className="brand" href="/"><img className="brand-logo" src="/salhi-auto-logo.png" alt="SALHI AUTO" /></Link><Link className="saved-back" href="/#cars">العودة إلى الموقع ←</Link></header>{children}</main>;
}

export function FavoritesView({ cars }: { cars: Vehicle[] }) {
  const [ids, setIds] = useSavedCars("salhi-auto-favorites", cars);
  const items = cars.filter((car) => ids.includes(car.id));
  const remove = (id: string) => setIds((current) => current.filter((item) => item !== id));
  return <SavedLayout><section><p className="eyebrow">اختياراتك</p><h1>السيارات المفضلة</h1><p className="muted">قائمة محفوظة على هذا الجهاز دون الحاجة إلى حساب.</p>{items.length ? <div className="saved-list">{items.map((car) => <article key={car.id}><div className="saved-photo" style={car.image ? { backgroundImage: `url('${car.image}')` } : undefined} /><div><p className="eyebrow">{car.brand} · {car.year}</p><h2>{car.name}</h2><p>{car.km == null ? "" : `${formatDzd(car.km)} كم`}{car.fuel ? ` · ${car.fuel}` : ""}</p></div><strong>{vehiclePriceLabel(car)}</strong><Link href={`/cars/${car.slug}`}>التفاصيل</Link><button onClick={() => remove(car.id)}>إزالة</button></article>)}</div> : <div className="empty-results">لا توجد سيارات متاحة محفوظة في المفضلة. <Link href="/#cars">تصفح السيارات المتاحة</Link></div>}</section></SavedLayout>;
}

export function CompareView({ cars }: { cars: Vehicle[] }) {
  const [ids, setIds] = useSavedCars("salhi-auto-compare", cars);
  const items = cars.filter((car) => ids.includes(car.id)).slice(0, 2);
  const clear = () => setIds([]);
  const rows: [string, (car: Vehicle) => string][] = [["السيارة", (c) => `${c.brand} ${c.name}`], ["سنة الصنع", (c) => String(c.year)], ["السعر", (c) => vehiclePriceLabel(c)], ["المسافة المقطوعة", (c) => c.km == null ? "—" : `${formatDzd(c.km)} كم`], ["نوع الوقود", (c) => c.fuel || "—"], ["ناقل الحركة", (c) => c.transmission || "—"], ["المحرك", (c) => c.engine || "—"], ["اللون", (c) => c.color || "—"]];
  return <SavedLayout><section><p className="eyebrow">اختيار أوضح</p><h1>مقارنة السيارات</h1><p className="muted">قارن سيارتين متاحتين كحد أقصى.</p>{items.length === 2 ? <><div className="compare-page-table"><table><tbody>{rows.map(([label, value]) => <tr key={label}><th>{label}</th>{items.map((car) => <td key={car.id}>{value(car)}</td>)}</tr>)}</tbody></table></div><button className="saved-clear" onClick={clear}>مسح المقارنة</button></> : <div className="empty-results">اختر سيارتين متاحتين من المخزون لبدء المقارنة. <Link href="/#cars">تصفح السيارات</Link><p>تم اختيار {items.length} من 2.</p></div>}</section></SavedLayout>;
}
