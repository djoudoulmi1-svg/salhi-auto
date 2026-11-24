import Link from "next/link";
import { getVehicles } from "@/lib/vehicles";
import { formatDzd, vehiclePriceLabel } from "@/lib/vehicle-format";
import { PrintCatalogueButton } from "@/components/print-catalogue";

export const dynamic = "force-dynamic";

export default async function CataloguePage() {
  const cars = await getVehicles({ availableOnly: true });
  return <main className="stock-catalogue" dir="rtl"><header><Link className="brand" href="/"><span className="brand-mark">S</span><span>SALHI <b>AUTO</b><small>ورقلة · الجزائر</small></span></Link><div className="no-print"><Link className="outline-button dark-outline" href="/#cars">العودة للمخزون</Link> <PrintCatalogueButton/></div></header><section className="stock-catalogue-title"><p className="eyebrow">Salhi Auto · ورقلة</p><h1>دليل السيارات المتاحة</h1><p>المخزون الحالي · {cars.length} سيارة</p></section>{cars.length ? <section className="stock-catalogue-grid">{cars.map((car)=><article key={car.id}><div className="stock-catalogue-photo" style={car.image?{backgroundImage:`url('${car.image}')`}:undefined}/><div><p className="eyebrow">{car.brand} · {car.year} · {car.condition==="new"?"جديدة":"مستعملة"}</p><h2>{car.name}</h2><p>{[car.km==null?"":`${formatDzd(car.km)} كم`,car.fuel,car.transmission,car.color].filter(Boolean).join(" · ")}</p><strong>{vehiclePriceLabel(car)}</strong><Link href={`/cars/${car.slug}`}>تفاصيل السيارة</Link></div></article>)}</section>:<div className="admin-empty">لا توجد سيارات متاحة حالياً.</div>}<footer>اتصال: 0770 27 27 94 · WhatsApp: 0550 50 98 94 · contact@salhiauto.com</footer></main>;
}
