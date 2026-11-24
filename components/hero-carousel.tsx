"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { demoCars } from "@/lib/demo-cars";

export function HeroCarousel() {
  const [active, setActive] = useState(0);
  useEffect(() => {
    const timer = window.setInterval(() => setActive((index) => (index + 1) % demoCars.length), 5000);
    return () => window.clearInterval(timer);
  }, []);
  const car = demoCars[active];
  const previous = () => setActive((active + demoCars.length - 1) % demoCars.length);
  const next = () => setActive((active + 1) % demoCars.length);
  return <>
    <div className="hero-image" style={{ backgroundImage: `url('${car.image}')` }} key={car.id} />
    <div className="hero-count"><button aria-label="السيارة السابقة" onClick={previous}>‹</button><b>{String(active + 1).padStart(2, "0")}</b><span>/</span>{String(demoCars.length).padStart(2, "0")}<button aria-label="السيارة التالية" onClick={next}>›</button></div>
    <div className="hero-dots" aria-label="اختيار السيارة">{demoCars.map((item, index) => <button key={item.id} aria-label={`عرض ${item.brand} ${item.name}`} aria-current={index === active} className={index === active ? "active" : ""} onClick={() => setActive(index)} />)}</div>
    <Link className="hero-feature-link" href={`/cars/${car.id}`}>اكتشف {car.brand} {car.name} <b>←</b></Link>
  </>;
}
