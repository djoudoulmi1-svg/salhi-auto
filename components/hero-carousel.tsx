"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import type { Vehicle } from "@/lib/vehicles";

export function HeroCarousel({ cars }: { cars: Vehicle[] }) {
  const [active, setActive] = useState(0);
  useEffect(() => {
    if (cars.length < 2) return;
    const timer = window.setInterval(() => setActive((index) => (index + 1) % cars.length), 5000);
    return () => window.clearInterval(timer);
  }, [cars.length]);
  if (!cars.length) return <div className="hero-image hero-image-empty" aria-hidden="true" />;
  const featured = cars.filter((car) => car.featured);
  const items = featured.length ? [...featured, ...cars.filter((car) => !car.featured)] : cars;
  const current = items[active % items.length];
  const previous = () => setActive((index) => (index + items.length - 1) % items.length);
  const next = () => setActive((index) => (index + 1) % items.length);
  return <>
    <div className="hero-image" style={current.image ? { backgroundImage: `url('${current.image}')` } : undefined} key={current.id} />
    {items.length > 1 && <>
      <div className="hero-count"><button aria-label="السيارة السابقة" onClick={previous}>‹</button><b>{String((active % items.length) + 1).padStart(2, "0")}</b><span>/</span>{String(items.length).padStart(2, "0")}<button aria-label="السيارة التالية" onClick={next}>›</button></div>
      <div className="hero-dots" aria-label="اختيار السيارة">{items.map((item, index) => <button key={item.id} aria-label={`عرض ${item.brand} ${item.name}`} aria-current={active === index} className={active === index ? "active" : ""} onClick={() => setActive(index)} />)}</div>
    </>}
    <Link className="hero-feature-link" href={`/cars/${current.slug}`}>اكتشف {current.brand} {current.name} <b>←</b></Link>
  </>;
}
