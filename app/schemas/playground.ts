import { z } from 'zod';

export const PlaygroundSchema = z.object({
  park_id: z.string().min(1),
  osm_id: z.string().min(1),
  name: z.string(),
  latitude: z.number().min(-90).max(90),
  longitude: z.number().min(-180).max(180),
  osm_tags: z.record(z.string(), z.string()).optional(),
  amenities: z.array(z.string()).optional(),
  parkings: z.array(z.string()).optional(),
  average_rating: z.number().min(1).max(5).optional(),
  rating_count: z.number().int().min(0).optional(),
  created_at: z.iso.datetime(),
  updated_at: z.iso.datetime(),
  location_hash: z.string().optional(),
});

export type Playground = z.infer<typeof PlaygroundSchema>;

// Schema for creating a new playground (without timestamps)
export const CreatePlaygroundSchema = PlaygroundSchema.omit({
  created_at: true,
  updated_at: true,
}).extend({
  created_at: z.iso.datetime().optional(),
  updated_at: z.iso.datetime().optional(),
});

export type CreatePlayground = z.infer<typeof CreatePlaygroundSchema>;

// Schema for updating a playground (all fields optional except park_id)
export const UpdatePlaygroundSchema = PlaygroundSchema.partial().required({
  park_id: true,
});

export type UpdatePlayground = z.infer<typeof UpdatePlaygroundSchema>;
