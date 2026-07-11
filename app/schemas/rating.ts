import { z } from 'zod';

export const RatingRecordSchema = z.object({
  playground_id: z.string().min(1),
  user_id: z.string().min(1),
  rating: z.number().int().min(1).max(5),
  notes: z.string().optional(),
  created_at: z.iso.datetime(),
  updated_at: z.iso.datetime(),
});

export type RatingRecord = z.infer<typeof RatingRecordSchema>;

export const CreateRatingRecordSchema = RatingRecordSchema.omit({
  created_at: true,
  updated_at: true,
}).extend({
  created_at: z.iso.datetime().optional(),
  updated_at: z.iso.datetime().optional(),
});

export type CreateRatingRecord = z.infer<typeof CreateRatingRecordSchema>;
