"use client";

import { useEffect, useMemo, useState } from "react";
import type { Vehicle } from "@/lib/vehicles";
import { formatDzd, hasActiveDiscount, vehiclePriceLabel } from "@/lib/vehicle-format";

export function InteractiveCatalog({ cars }: { cars: Vehicle[] }) {
  const [query, setQuery] = useState("");
  const [brand, setBrand] = useState("");
  const [fuel, setFuel] = useState("");
  const [transmission, setTransmission] = useState("");
  const [fromYear, setFromYear] = useState("");
  const [toYear, setToYear] = useState("");
  const [minPrice, setMinPrice] = useState(0);
  const [maxPrice, setMaxPrice] = useState(12000000);
  const [page, setPage] = useState(1);
  const [sort, setSort] = useState("newest");
  const [favorites, setFavorites] = useState<string[]>([]);
  const [compare, setCompare] = useState<string[]>([]);

  useEffect(() => {
    try {
      setFavorites(JSON.parse(localStorage.getItem("salhi-auto-favorites") || "[]"));
      setCompare(JSON.parse(localStorage.getItem("salhi-auto-compare") || "[]"));
    } catch { setFavorites([]); setCompare([]); }
  }, []);
  useEffect(() => { localStorage.setItem("salhi-auto-favorites", JSON.stringify(favorites)); }, [favorites]);
  useEffect(() => { localStorage.setItem("salhi-auto-compare", JSON.stringify(compare)); }, [compare]);

  const filtered = useMemo(() => cars.filter((car) => {
    const text = `${car.brand} ${car.name} ${car.year}`.toLowerCase();
    const displayedPrice = hasActiveDiscount(car) ? car.discountPrice! : car.price;
    return (!query || text.includes(query.trim().toLowerCase())) && (!brand || car.brand === brand) && (!fuel || car.fuel === fuel) && (!transmission || car.transmission === transmission) && (!fromYear || car.year >= Number(fromYear)) && (!toYear || car.year <= Number(toYear)) && (car.hidePrice || displayedPrice == null || (displayedPrice >= minPrice && displayedPrice <= maxPrice));
  }).sort((a, b) => sort === "price-asc" ? (a.price ?? Number.MAX_SAFE_INTEGER) - (b.price ?? Number.MAX_SAFE_INTEGER) : sort === "price-desc" ? (b.price ?? 0) - (a.price ?? 0) : sort === "year-desc" ? b.year - a.year : new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()), [cars, query, brand, fuel, transmission, fromYear, toYear, minPrice, maxPrice, sort]);
  const pageCount = Math.max(1, Math.ceil(filtered.length / 12));
  const visibleCars = filtered.slice((page - 1) * 12, page * 12);
  const toggleFavorite = (id: string) => setFavorites((items) => items.includes(id) ? items.filter((item) => item !== id) : [...items, id]);
  const toggleCompare = (id: string) => setCompare((items) => items.includes(id) ? items.filter((item) => item !== id) : items.length >= 2 ? items : [...items, id]);
  const clearFilters = () => { setQuery(""); setBrand(""); setFuel(""); setTransmission(""); setFromYear(""); setToYear(""); setMinPrice(0); setMaxPrice(12000000); setPage(1); };
  const selectedCars = compare.map((id) => cars.find((car) => car.id === id)).filter((car): car is Vehicle => Boolean(car));

  return <>
    <div className="filters">
      <label className="search"><span>⌕</span><input value={query} onChange={(e) => { setQuery(e.target.value); setPage(1); }} placeholder="ابحث عن الماركة أو الموديل أو السنة..." aria-label="بحث عن سيارة" /></label>
      <select aria-label="العلامة التجارية" value={brand} onChange={(e) => { setBrand(e.target.value); setPage(1); }}><option value="">كل العلامات</option>{[...new Set(cars.map((car) => car.brand))].map((name) => <option key={name}>{name}</option>)}</select>
      <select aria-label="نوع الوقود" value={fuel} onChange={(e) => { setFuel(e.target.value); setPage(1); }}><option value="">كل أنواع الوقود</option>{[...new Set(cars.map((car) => car.fuel).filter(Boolean))].map((name) => <option key={name}>{name}</option>)}</select>
      <select aria-label="ناقل الحركة" value={transmission} onChange={(e) => { setTransmission(e.target.value); setPage(1); }}><option value="">كل نواقل الحركة</option>{[...new Set(cars.map((car) => car.transmission).filter(Boolean))].map((name) => <option key={name}>{name}</option>)}</select>
      <div className="year-filter"><input type="number" placeholder="من سنة" aria-label="من سنة" value={fromYear} onChange={(e) => { setFromYear(e.target.value); setPage(1); }} /><input type="number" placeholder="إلى سنة" aria-label="إلى سنة" value={toYear} onChange={(e) => { setToYear(e.target.value); setPage(1); }} /></div>
      <select aria-label="ترتيب السيارات" value={sort} onChange={(e) => setSort(e.target.value)}><option value="newest">الأحدث إضافةً</option><option value="price-asc">السعر: الأقل أولاً</option><option value="price-desc">السعر: الأعلى أولاً</option><option value="year-desc">الأحدث سنةً</option></select>
      <button type="button" onClick={clearFilters}>مسح الفلاتر</button>
    </div>
    <div className="price-filter"><label>السعر من <strong>{formatDzd(minPrice)} دج</strong><input type="range" min="0" max="12000000" step="100000" value={minPrice} onChange={(e) => { setMinPrice(Math.min(Number(e.target.value), maxPrice)); setPage(1); }} /></label><label>السعر إلى <strong>{formatDzd(maxPrice)} دج</strong><input type="range" min="0" max="12000000" step="100000" value={maxPrice} onChange={(e) => { setMaxPrice(Math.max(Number(e.target.value), minPrice)); setPage(1); }} /></label></div>
    <div className="catalog-tools"><span>المفضلة المحفوظة: {favorites.length}</span><a href="/favorites">قائمة المفضلة ←</a><span>النتائج: {filtered.length}</span></div>
    {visibleCars.length ? <div className="car-grid">{visibleCars.map((car) => <article className="car-card" key={car.id}><div className="car-photo" style={car.image ? { backgroundImage: `url('${car.image}')` } : undefined}>{car.featured && <span>مختارة</span>}<button className={`heart ${favorites.includes(car.id) ? "heart-active" : ""}`} aria-label={favorites.includes(car.id) ? "إزالة من المفضلة" : "أضف للمفضلة"} onClick={() => toggleFavorite(car.id)}>{favorites.includes(car.id) ? "♥" : "♡"}</button></div><div className="car-info"><p className="eyebrow">{car.brand} <i>·</i> {car.year}</p><h3>{car.name}</h3><div className="specs"><span>{car.km == null ? "—" : `${formatDzd(car.km)} كم`}</span>{car.fuel && <span>{car.fuel}</span>}{car.transmission && <span>{car.transmission}</span>}</div><div className="card-bottom"><strong>{car.hidePrice || car.price == null ? vehiclePriceLabel(car) : <>{hasActiveDiscount(car) && <del>{formatDzd(car.price)} </del>}{formatDzd(hasActiveDiscount(car) ? car.discountPrice! : car.price)} <small>دج</small></>}</strong><a href={`/cars/${car.slug}`} aria-label={`تفاصيل ${car.name}`}>التفاصيل <b>←</b></a></div><button type="button" className={`compare-toggle ${compare.includes(car.id) ? "tool-active" : ""}`} onClick={() => toggleCompare(car.id)}>{compare.includes(car.id) ? "✓ تمت الإضافة للمقارنة" : "＋ أضف للمقارنة"}</button></div></article>)}</div> : <div className="empty-results"><strong>{cars.length ? "لم نعثر على سيارات تطابق هذه الخيارات." : "لا توجد سيارات متاحة حالياً."}</strong><p>{cars.length ? "جرّب تغيير البحث أو الفلاتر." : "سيُعرض مخزون Salhi Auto هنا عند إضافته من لوحة الإدارة."}</p>{cars.length > 0 && <button type="button" onClick={clearFilters}>مسح الفلاتر</button>}</div>}
    {filtered.length > 0 && <div className="inventory-foot"><span>عرض {visibleCars.length} من {filtered.length} سيارات</span><div className="pages"><button disabled={page <= 1} onClick={() => setPage(page - 1)}>‹</button>{Array.from({ length: pageCount }, (_, i) => <button key={i} className={page === i + 1 ? "active" : ""} onClick={() => setPage(i + 1)}>{i + 1}</button>)}<button disabled={page >= pageCount} onClick={() => setPage(page + 1)}>›</button></div></div>}
    {selectedCars.length > 0 && <aside className="compare-bar"><span>المقارنة: {selectedCars.length} من 2</span>{selectedCars.map((car) => <span key={car.id}>{car.brand} {car.name}<button aria-label="إزالة من المقارنة" onClick={() => toggleCompare(car.id)}>×</button></span>)}<a className="compare-page-link" href="/compare">صفحة المقارنة</a><button onClick={() => setCompare([])}>إفراغ</button></aside>}
  </>;
}
