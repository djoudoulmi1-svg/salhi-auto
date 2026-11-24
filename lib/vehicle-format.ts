import type { Vehicle } from "@/lib/vehicles";

export const formatDzd = (value: number) => new Intl.NumberFormat("fr-DZ").format(value);
export const hasActiveDiscount = (vehicle: Vehicle) => vehicle.discountPrice != null && (!vehicle.discountEndsAt || new Date(vehicle.discountEndsAt).getTime() > Date.now());
export const vehiclePriceLabel = (vehicle: Vehicle) => {
  if (vehicle.hidePrice || vehicle.price == null) return "اتصل لمعرفة السعر";
  return `${formatDzd(hasActiveDiscount(vehicle) ? vehicle.discountPrice! : vehicle.price)} دج`;
};
