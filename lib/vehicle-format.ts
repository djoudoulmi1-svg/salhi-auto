import type { Vehicle } from "@/lib/vehicles";

export const formatDzd = (value: number) => new Intl.NumberFormat("fr-DZ").format(value);
export const hasActiveDiscount = (vehicle: Vehicle) => (vehicle.discountPrice != null || vehicle.discountPercentage != null) && (!vehicle.discountStartsAt || new Date(vehicle.discountStartsAt).getTime() <= Date.now()) && (!vehicle.discountEndsAt || new Date(vehicle.discountEndsAt).getTime() > Date.now());
export const effectiveVehiclePrice = (vehicle: Vehicle) => vehicle.discountPrice ?? (vehicle.price != null && vehicle.discountPercentage != null ? Math.round(vehicle.price * (100 - vehicle.discountPercentage) / 100) : vehicle.price);
export const vehiclePriceLabel = (vehicle: Vehicle) => {
  if (vehicle.hidePrice || vehicle.price == null) return "اتصل لمعرفة السعر";
  return `${formatDzd(hasActiveDiscount(vehicle) ? effectiveVehiclePrice(vehicle)! : vehicle.price)} دج`;
};
