"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { demoCars } from "@/lib/demo-cars";

export default function ComparePage() {
  const [ids, setIds] = useState<string[]>([]);
  useEffect(() => { try { setIds(JSON.parse(localStorage.getItem("salhi-auto-compare") || "[]")); } catch { setIds([]); } }, []);
  const items = demoCars.filter((car) => ids.includes(car.id)).slice(0, 2);
  const clear = () => { setIds([]); localStorage.setItem("salhi-auto-compare", "[]"); };
  const fmt = (n: number) => new Intl.NumberFormat("fr-DZ").format(n);
  const rows: [string, (car: typeof demoCars[number]) => string][] = [["السيارة", (c) => `${c.brand} ${c.name}`], ["سنة الصنع", (c) => String(c.year)], ["السعر", (c) => `${fmt(c.price)} دج`], ["المسافة المقطوعة", (c) => `${fmt(c.km)} كم`], ["نوع الوقود", (c) => c.fuel], ["ناقل الحركة", (c) => c.transmission]];
  return <main className="saved-page" dir="rtl"><header><Link className="brand" href="/"><span className="brand-mark">S</span><span>SALHI <b>AUTO</b><small>ورقلة · الجزائر</small></span></Link><Link className="saved-back" href="/#cars">العودة إلى السيارات ←</Link></header><section><p className="eyebrow">اختيار أوضح</p><h1>مقارنة السيارات</h1><p className="muted">قارن مواصفات سيارتين كحد أقصى.</p>{items.length === 2 ? <><div className="compare-page-table"><table><tbody>{rows.map(([label, value]) => <tr key={label}><th>{label}</th>{items.map((car) => <td key={car.id}>{value(car)}</td>)}</tr>)}</tbody></table></div><button className="saved-clear" onClick={clear}>مسح المقارنة</button></> : <div className="empty-results">اختر سيارتين من الكتالوج لبدء المقارنة. <Link href="/#cars">تصفح السيارات</Link><p>تم اختيار {items.length} من 2.</p></div>}</section></main>;
}
