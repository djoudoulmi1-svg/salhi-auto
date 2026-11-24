"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { demoCars } from "@/lib/demo-cars";

export default function FavoritesPage() {
  const [ids, setIds] = useState<string[]>([]);
  useEffect(() => { try { setIds(JSON.parse(localStorage.getItem("salhi-auto-favorites") || "[]")); } catch { setIds([]); } }, []);
  const items = demoCars.filter((car) => ids.includes(car.id));
  const remove = (id: string) => { const next = ids.filter((entry) => entry !== id); setIds(next); localStorage.setItem("salhi-auto-favorites", JSON.stringify(next)); };
  return <main className="saved-page" dir="rtl"><header><Link className="brand" href="/"><span className="brand-mark">S</span><span>SALHI <b>AUTO</b><small>ورقلة · الجزائر</small></span></Link><Link className="saved-back" href="/">العودة إلى الموقع ←</Link></header><section><p className="eyebrow">اختياراتك</p><h1>السيارات المفضلة</h1><p className="muted">قائمة محفوظة على هذا الجهاز دون الحاجة إلى حساب.</p>{items.length ? <div className="saved-list">{items.map((car) => <article key={car.id}><div className="saved-photo" style={{ backgroundImage: `url('${car.image}')` }} /><div><p className="eyebrow">{car.brand} · {car.year}</p><h2>{car.name}</h2><p>{new Intl.NumberFormat("fr-DZ").format(car.km)} كم · {car.fuel}</p></div><strong>{new Intl.NumberFormat("fr-DZ").format(car.price)} دج</strong><button onClick={() => remove(car.id)}>إزالة</button></article>)}</div> : <div className="empty-results">لم تضف سيارات إلى المفضلة بعد. <Link href="/#cars">تصفح السيارات</Link></div>}</section></main>;
}
