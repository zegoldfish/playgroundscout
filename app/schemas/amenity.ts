import { z } from "zod";

export const AmenitySchema = z.object({
  amenity_id: z.string().min(1),
  name: z.string().transform((val) => val.toLowerCase()),
});

export type Amenity = z.infer<typeof AmenitySchema>;

// Schema for creating a new amenity
export const CreateAmenitySchema = AmenitySchema.omit({
  amenity_id: true,
});

export type CreateAmenity = z.infer<typeof CreateAmenitySchema>;

// Schema for updating an amenity
export const UpdateAmenitySchema = AmenitySchema.partial().required({
  amenity_id: true,
  name: true,
});

export type UpdateAmenity = z.infer<typeof UpdateAmenitySchema>;