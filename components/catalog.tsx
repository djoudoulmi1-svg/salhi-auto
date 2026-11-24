"use client";

import { useEffect, useMemo, useState } from "react";
import { demoCars } from "@/lib/demo-cars";
type Car = (typeof demoCars)[number];
const dinar = (value: number) => new Intl.NumberFormat("fr-DZ").format(value);

export function InteractiveCatalog() {
  const [query, setQuery] = useState("");
  const [brand, setBrand] = useState("");
  const [fuel, setFuel] = useState("");
  const [transmission, setTransmission] = useState("");
  const [fromYear, setFromYear] = useState("");
  const [toYear, setToYear] = useState("");
  const [minPrice, setMinPrice] = useState(0);
  const [maxPrice, setMaxPrice] = useState(12000000);
  const [page, setPage] = useState(1);
  const [favorites, setFavorites] = useState<string[]>([]);
  const [compare, setCompare] = useState<string[]>([]);
  const [showCompare, setShowCompare] = useState(false);
  const [favoritesOnly, setFavoritesOnly] = useState(false);

  useEffect(() => {
    try {
      setFavorites(JSON.parse(localStorage.getItem("salhi-auto-favorites") || "[]"));
      setCompare(JSON.parse(localStorage.getItem("salhi-auto-compare") || "[]"));
    } catch { setFavorites([]); setCompare([]); }
  }, []);
  useEffect(() => { localStorage.setItem("salhi-auto-favorites", JSON.stringify(favorites)); }, [favorites]);
  useEffect(() => { localStorage.setItem("salhi-auto-compare", JSON.stringify(compare)); }, [compare]);

  const filtered = useMemo(() => demoCars.filter((car) => {
    const text = `${car.brand} ${car.name} ${car.year}`.toLowerCase();
    return (!query || text.includes(query.trim().toLowerCase())) && (!brand || car.brand === brand) && (!fuel || car.fuel === fuel) && (!transmission || car.transmission === transmission) && (!fromYear || car.year >= Number(fromYear)) && (!toYear || car.year <= Number(toYear)) && car.price >= minPrice && car.price <= maxPrice && (!favoritesOnly || favorites.includes(car.id));
  }), [query, brand, fuel, transmission, fromYear, toYear, minPrice, maxPrice, favoritesOnly, favorites]);
  const pageCount = Math.max(1, Math.ceil(filtered.length / 12));
  const visibleCars = filtered.slice((page - 1) * 12, page * 12);
  const toggleFavorite = (id: string) => setFavorites((items) => items.includes(id) ? items.filter((item) => item !== id) : [...items, id]);
  const toggleCompare = (id: string) => setCompare((items) => items.includes(id) ? items.filter((item) => item !== id) : items.length >= 2 ? items : [...items, id]);
  const clearFilters = () => { setQuery(""); setBrand(""); setFuel(""); setTransmission(""); setFromYear(""); setToYear(""); setMinPrice(0); setMaxPrice(12000000); setFavoritesOnly(false); setPage(1); };

  return <>
    <div className="filters">
      <label className="search"><span>⌕</span><input value={query} onChange={(e) => { setQuery(e.target.value); setPage(1); }} placeholder="ابحث عن الماركة أو الموديل أو السنة..." aria-label="بحث عن سيارة" /></label>
      <select aria-label="العلامة التجارية" value={brand} onChange={(e) => { setBrand(e.target.value); setPage(1); }}><option value="">كل العلامات</option>{[...new Set(demoCars.map((car) => car.brand))].map((name) => <option key={name}>{name}</option>)}</select>
      <select aria-label="نوع الوقود" value={fuel} onChange={(e) => { setFuel(e.target.value); setPage(1); }}><option value="">كل أنواع الوقود</option><option>بنزين</option><option>ديزل</option></select>
      <select aria-label="ناقل الحركة" value={transmission} onChange={(e) => { setTransmission(e.target.value); setPage(1); }}><option value="">كل نواقل الحركة</option><option>أوتوماتيك</option><option>يدوي</option></select>
      <div className="year-filter"><input type="number" placeholder="من سنة" aria-label="من سنة" value={fromYear} onChange={(e) => { setFromYear(e.target.value); setPage(1); }} /><input type="number" placeholder="إلى سنة" aria-label="إلى سنة" value={toYear} onChange={(e) => { setToYear(e.target.value); setPage(1); }} /></div>
      <button type="button" onClick={clearFilters}>مسح الفلاتر</button>
    </div>
    <div className="price-filter"><label>السعر من <strong>{dinar(minPrice)} دج</strong><input type="range" min="0" max="12000000" step="100000" value={minPrice} onChange={(e) => { setMinPrice(Math.min(Number(e.target.value), maxPrice)); setPage(1); }} /></label><label>السعر إلى <strong>{dinar(maxPrice)} دج</strong><input type="range" min="0" max="12000000" step="100000" value={maxPrice} onChange={(e) => { setMaxPrice(Math.max(Number(e.target.value), minPrice)); setPage(1); }} /></label></div>
    <div className="catalog-tools"><button type="button" className={favoritesOnly ? "tool-active" : ""} onClick={() => { setFavoritesOnly(!favoritesOnly); setPage(1); }}>♡ تصفية بالمفضلة ({favorites.length})</button><a href="/favorites">قائمة المفضلة ←</a><span>نتائج البحث: {filtered.length}</span></div>
    <div className="car-grid">{visibleCars.map((car) => <article className="car-card" key={car.id}><div className="car-photo" style={{ backgroundImage: `url('${car.image}')` }}><span>{car.tag}</span><button className={`heart ${favorites.includes(car.id) ? "heart-active" : ""}`} aria-label={favorites.includes(car.id) ? "إزالة من المفضلة" : "أضف للمفضلة"} onClick={() => toggleFavorite(car.id)}>{favorites.includes(car.id) ? "♥" : "♡"}</button></div><div className="car-info"><p className="eyebrow">{car.brand} <i>·</i> {car.year}</p><h3>{car.name}</h3><div className="specs"><span>{dinar(car.km)} كم</span><span>{car.fuel}</span><span>{car.transmission}</span></div><div className="card-bottom"><strong>{dinar(car.price)} <small>دج</small></strong><a href={`/cars/${car.id}`} aria-label={`تفاصيل ${car.name}`}>التفاصيل <b>←</b></a></div><button type="button" className={`compare-toggle ${compare.includes(car.id) ? "tool-active" : ""}`} onClick={() => toggleCompare(car.id)}>{compare.includes(car.id) ? "✓ تمت الإضافة للمقارنة" : "＋ أضف للمقارنة"}</button></div></article>)}</div>
    {filtered.length === 0 && <div className="empty-results"><strong>لم نعثر على سيارات مطابقة.</strong><button type="button" onClick={clearFilters}>مسح الفلاتر</button></div>}
    <div className="inventory-foot"><span>عرض {visibleCars.length} من {filtered.length} سيارات</span><div className="pages"><button disabled={page <= 1} onClick={() => setPage(page - 1)}>‹</button>{Array.from({ length: pageCount }, (_, i) => <button key={i} className={page === i + 1 ? "active" : ""} onClick={() => setPage(i + 1)}>{i + 1}</button>)}<button disabled={page >= pageCount} onClick={() => setPage(page + 1)}>›</button></div></div>
    {compare.length > 0 && <aside className="compare-bar"><span>المقارنة: {compare.length} من 2</span>{compare.map((id) => { const car = demoCars.find((item) => item.id === id)!; return <span key={id}>{car.brand} {car.name}<button aria-label="إزالة من المقارنة" onClick={() => toggleCompare(id)}>×</button></span>; })}<button className="gold-button" disabled={compare.length < 2} onClick={() => setShowCompare(true)}>عرض المقارنة</button><a className="compare-page-link" href="/compare">صفحة المقارنة</a><button onClick={() => setCompare([])}>إفراغ</button></aside>}
    {showCompare && <div className="compare-overlay" role="dialog" aria-modal="true" aria-label="مقارنة السيارات"><section><button className="compare-close" onClick={() => setShowCompare(false)} aria-label="إغلاق">×</button><h2>مقارنة السيارات</h2><table><tbody>{([["السيارة", (c: Car) => `${c.brand} ${c.name}`], ["السنة", (c: Car) => c.year], ["السعر", (c: Car) => `${dinar(c.price)} دج`], ["المسافة المقطوعة", (c: Car) => `${dinar(c.km)} كم`], ["الوقود", (c: Car) => c.fuel], ["ناقل الحركة", (c: Car) => c.transmission]] as const).map(([label, value]) => <tr key={label}><th>{label}</th>{compare.map((id) => <td key={id}>{value(demoCars.find((item) => item.id === id)!)}</td>)}</tr>)}</tbody></table></section></div>}
  </>;
}
