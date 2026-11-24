import { CompareView } from "@/components/saved-vehicles";
import { getVehicles } from "@/lib/vehicles";

export const dynamic = "force-dynamic";

export default async function ComparePage() {
  return <CompareView cars={await getVehicles({ availableOnly: true })} />;
}
