import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { CarDetail } from "@/components/car-detail";
import { demoCars } from "@/lib/demo-cars";

export function generateStaticParams() {
  return demoCars.map((car) => ({ slug: car.id }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const car = demoCars.find((item) => item.id === slug);
  if (!car) return { title: "السيارة غير موجودة | SALHI AUTO" };
  return { title: `${car.brand} ${car.name} ${car.year} | SALHI AUTO`, description: `تفاصيل ${car.brand} ${car.name} ${car.year} المتاحة لدى Salhi Auto في ورقلة، الجزائر.` };
}

export default async function VehiclePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const car = demoCars.find((item) => item.id === slug);
  if (!car) notFound();
  const related = demoCars.filter((item) => item.id !== car.id).slice(0, 4);
  return <CarDetail car={car} related={related} />;
}
