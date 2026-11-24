import { FavoritesView } from "@/components/saved-vehicles";
import { getVehicles } from "@/lib/vehicles";

export const dynamic = "force-dynamic";

export default async function FavoritesPage() {
  return <FavoritesView cars={await getVehicles({ availableOnly: true })} />;
}
