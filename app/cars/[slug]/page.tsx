import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { CarDetail } from "@/components/car-detail";
import { getVehicleBySlug, getVehicles } from "@/lib/vehicles";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const car = await getVehicleBySlug(slug);
  if (!car) return { title: "السيارة غير متاحة | SALHI AUTO" };
  const title = `${car.brand} ${car.name} ${car.year} | SALHI AUTO`;
  const description = car.description.ar || `تفاصيل ${car.brand} ${car.name} ${car.year} لدى Salhi Auto في ورقلة، الجزائر.`;
  const image = car.images.find(Boolean) || car.image;
  const pageUrl = `/cars/${encodeURIComponent(car.slug)}`;

  return {
    title,
    description,
    alternates: { canonical: pageUrl },
    openGraph: {
      type: "website",
      locale: "ar_DZ",
      siteName: "SALHI AUTO",
      title,
      description,
      url: pageUrl,
      images: image ? [{ url: image, alt: `${car.brand} ${car.name} ${car.year}` }] : [],
    },
    twitter: {
      card: image ? "summary_large_image" : "summary",
      title,
      description,
      images: image ? [image] : [],
    },
  };
}

export default async function VehiclePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const car = await getVehicleBySlug(slug);
  if (!car) notFound();
  const vehicles = await getVehicles({ availableOnly: true });
  const related = vehicles.filter((item) => item.slug !== car.slug && (item.brand === car.brand || (car.price != null && item.price != null && Math.abs(item.price - car.price) < car.price * 0.25))).slice(0, 4);
  return <CarDetail car={car} related={related} />;
}

