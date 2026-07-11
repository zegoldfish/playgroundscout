import { z } from "zod";

export const ParkingSchema = z.object({
  parking_id: z.string().min(1),
  name: z.string(),
});

export type Parking = z.infer<typeof ParkingSchema>;

// Schema for creating a new parking
export const CreateParkingSchema = ParkingSchema.omit({
  parking_id: true,
});

export type CreateParking = z.infer<typeof CreateParkingSchema>;

// Schema for updating a parking
export const UpdateParkingSchema = ParkingSchema.partial().required({
  parking_id: true,
  name: true,
});

export type UpdateParking = z.infer<typeof UpdateParkingSchema>;
