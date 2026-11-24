import { createSupabaseAdmin } from "@/lib/supabase-admin";

export type Vehicle = {
  id: string;
  databaseId: string;
  slug: string;
  brand: string;
  name: string;
  year: number;
  price: number | null;
  hidePrice: boolean;
  status: "available" | "reserved" | "sold";
  condition: "new" | "used";
  km: number | null;
  fuel: string;
  transmission: string;
  engine: string;
  color: string;
 description: Record<string, string>;
  features: string[];
  image: string;
  images: string[];
  featured: boolean;
  discountPrice: number | null;
  discountPercentage: number | null;
  discountStartsAt: string | null;
  discountEndsAt: string | null;
  createdAt: string;
};

type VehicleRow = {
  id: string;
  slug: string;
  brand: string;
  model: string;
  year: number;
  price_dzd: number | string | null;
  hide_price: boolean;
  status: Vehicle["status"];
  condition: Vehicle["condition"];
  mileage_km: number | null;
  fuel: string | null;
  transmission: string | null;
  engine: string | null;
  color: string | null;
  description: Record<string, string> | null;
  features: string[] | null;
  images: string[] | null;
  featured: boolean;
  discount_price_dzd: number | string | null;
  discount_percentage: number | null;
  discount_starts_at: string | null;
  discount_ends_at: string | null;
  created_at: string;
};

function mapVehicle(row: VehicleRow): Vehicle {
  const images = row.images || [];
  return {
    id: row.slug,
    databaseId: row.id,
    slug: row.slug,
    brand: row.brand,
    name: row.model,
    year: row.year,
    price: row.price_dzd == null ? null : Number(row.price_dzd),
    hidePrice: row.hide_price,
    status: row.status,
    condition: row.condition,
    km: row.mileage_km,
    fuel: row.fuel || "",
    transmission: row.transmission || "",
    engine: row.engine || "",
    color: row.color || "",
    description: row.description || {},
    features: row.features || [],
    image: images[0] || "",
    images,
    featured: row.featured,
    discountPrice: row.discount_price_dzd == null ? null : Number(row.discount_price_dzd),
    discountPercentage: row.discount_percentage == null ? null : Number(row.discount_percentage),
    discountStartsAt: row.discount_starts_at,
    discountEndsAt: row.discount_ends_at,
    createdAt: row.created_at,
  };
}

export async function getVehicles({ availableOnly = false } = {}) {
  try {
    const admin = createSupabaseAdmin();
    let query = admin.from("vehicles").select("*").order("created_at", { ascending: false });
    if (availableOnly) query = query.eq("status", "available");
    const { data, error } = await query;
    if (error) throw error;
    return ((data || []) as VehicleRow[]).map(mapVehicle);
  } catch (error) {
    console.error("Salhi Auto inventory could not be loaded", error);
    return [];
  }
}

export async function getVehicleBySlug(slug: string, { availableOnly = true } = {}) {
  try {
    const admin = createSupabaseAdmin();
    let query = admin.from("vehicles").select("*").eq("slug", slug);
    if (availableOnly) query = query.eq("status", "available");
    const { data, error } = await query.maybeSingle();
    if (error) throw error;
    return data ? mapVehicle(data as VehicleRow) : null;
  } catch (error) {
    console.error("Salhi Auto vehicle could not be loaded", error);
    return null;
  }
}

export const formatDzd = (value: number) => new Intl.NumberFormat("fr-DZ").format(value);
export const vehiclePriceLabel = (vehicle: Vehicle) => {
  if (vehicle.hidePrice || vehicle.price == null) return "اتصل لمعرفة السعر";
  const discountActive = vehicle.discountPrice != null && (!vehicle.discountEndsAt || new Date(vehicle.discountEndsAt).getTime() > Date.now());
  const price = discountActive ? vehicle.discountPrice! : vehicle.price;
  return `${formatDzd(price)} دج`;
};
