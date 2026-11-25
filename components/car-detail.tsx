"use client";
import { BrandLogo } from "@/components/brand-logo";

import Link from "next/link";
import { useState } from "react";
import type { Vehicle } from "@/lib/vehicles";
import { formatDzd, hasActiveDiscount, vehiclePriceLabel } from "@/lib/vehicle-format";
import { InquiryForm } from "@/components/inquiry-form";

const phone = "+213770272794";
const whatsapp = "213550509894";

export function CarDetail({ car, related }: { car: Vehicle; related: Vehicle[] }) {
  const [copied, setCopied] = useState(false);
  const [selectedImage, setSelectedImage] = useState(0);
  const share = async () => {
    const url = window.location.href;
    if (navigator.share) await navigator.share({ title: `${car.brand} ${car.name} | Salhi Auto`, url });
    else { await navigator.clipboard.writeText(url); setCopied(true); window.setTimeout(() => setCopied(false), 2000); }
  };
  const shareFacebook = () => window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(window.location.href)}`, "_blank", "noopener,noreferrer");
  const description = car.description.ar || car.description.fr || car.description.en || "تواصل مع فريق المعرض لمعرفة مزيد من التفاصيل عن هذه السيارة.";
  const conditionLabel = car.condition === "new" ? "جديدة" : "مستعملة";
  const details: [string, string | number | null][] = [["سنة الصنع", car.year], ["المسافة المقطوعة", car.km == null ? null : `${formatDzd(car.km)} كم`], ["المحرك", car.engine || null], ["الوقود", car.fuel || null], ["ناقل الحركة", car.transmission || null], ["اللون", car.color || null], ["الحالة", conditionLabel]];
  const shownDetails = details.filter(([, value]) => value !== null && value !== "");
  const message = encodeURIComponent(`أرغب في الاستفسار عن ${car.brand} ${car.name} ${car.year} - ${typeof window === "undefined" ? "" : window.location.href}`);
  return <main className="detail-page" dir="rtl"><header className="detail-top"><Link className="brand" href="/"><BrandLogo /></Link><Link href="/#cars">← العودة إلى السيارات</Link></header><nav className="breadcrumb"><Link href="/">الرئيسية</Link><span>/</span><Link href="/#cars">السيارات</Link><span>/</span>{car.brand} {car.name}</nav><section className="detail-layout"><div className="detail-media"><div className="detail-main-photo">{car.images[selectedImage] && <img src={car.images[selectedImage]} alt={car.brand + " " + car.name} />}</div>{car.images.length > 1 && <div className="detail-thumbnails">{car.images.map((src, index) => <button key={`${src}-${index}`} className={selectedImage === index ? "selected" : ""} onClick={() => setSelectedImage(index)} aria-label={`عرض الصورة ${index + 1}`} style={{ backgroundImage: `url('${src}')` }} />)}</div>}{car.images[0] && <img className="detail-print-photo" src={car.images[0]} alt={car.brand + " " + car.name} />}</div><div className="detail-info"><p className="eyebrow">{car.brand} · {car.year}</p><h1>{car.name}</h1><p className="detail-condition">{conditionLabel} · متاحة لدى المعرض</p><strong className="detail-price">{vehiclePriceLabel(car)}</strong>{hasActiveDiscount(car) && car.price != null && !car.hidePrice && <del className="old-price">{formatDzd(car.price)} دج</del>}<p className="detail-description">{description}</p><div className="detail-actions"><a className="gold-button" href={`https://wa.me/${whatsapp}?text=${message}`} target="_blank" rel="noreferrer">استفسر عبر WhatsApp ↗</a><a className="outline-button dark-outline" href={`tel:${phone}`}>اتصل بالمعرض</a></div><div className="share-actions"><button onClick={share}>{copied ? "تم نسخ الرابط" : "نسخ / مشاركة الرابط"}</button><button onClick={shareFacebook}>Facebook</button><button onClick={() => window.print()}>طباعة / حفظ PDF</button></div></div></section><section className="detail-specs"><p className="eyebrow">المواصفات</p><h2>تفاصيل السيارة</h2>{shownDetails.length > 0 && <><div className="spec-cards">{shownDetails.slice(0, 4).map(([label, value]) => <article key={label}><span>{label}</span><b>{value}</b></article>)}</div><div className="detail-table"><table><tbody>{shownDetails.map(([label, value]) => <tr key={label}><th>{label}</th><td>{value}</td></tr>)}</tbody></table></div></>}{car.features.length > 0 && <><h3>التجهيزات</h3><ul className="features-list">{car.features.map((feature) => <li key={feature}>{feature}</li>)}</ul></>}</section><section className="inquiry-public"><p className="eyebrow">تواصل معنا</p><h2>مهتم بهذه السيارة؟</h2><p>أرسل طلبك وسيعود إليك فريق المعرض.</p><InquiryForm vehicleId={car.databaseId} vehicleLabel={`${car.brand} ${car.name} ${car.year}`} /></section>{related.length > 0 && <section className="related-cars"><h2>سيارات أخرى متاحة</h2><div className="car-grid">{related.map((item) => <Link href={`/cars/${item.slug}`} key={item.id} className="related-card"><div style={item.image ? { backgroundImage: `url('${item.image}')` } : undefined} /><b>{item.brand} {item.name}</b><span>{vehiclePriceLabel(item)}</span></Link>)}</div></section>}<footer className="detail-footer"><span>© {new Date().getFullYear()} SALHI AUTO · ورقلة، الجزائر</span><a href={`tel:${phone}`}>0770 27 27 94</a></footer></main>;
}
