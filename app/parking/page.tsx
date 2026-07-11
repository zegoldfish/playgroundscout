import { listParkings } from "@/app/actions/parking";
import ParkingPageClient from "@/app/components/ParkingPageClient";

export default async function ParkingPage() {
  const parkings = await listParkings();

  return <ParkingPageClient initialParkings={parkings} />;
}
