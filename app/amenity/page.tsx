import { listAmenities } from "@/app/actions/amenity";
import AmenityPageClient from "@/app/components/AmenityPageClient";

export const dynamic = "force-dynamic";

export default async function AmenityPage() {
  const amenities = await listAmenities();

  return <AmenityPageClient initialAmenities={amenities} />;
}