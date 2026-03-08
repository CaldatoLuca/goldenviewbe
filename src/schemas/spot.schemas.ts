import z from "zod/v3";

export const createSpotSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters").max(100, "Name too long"),
  address: z.string().max(200).optional(),
  place: z.string().max(100).optional(),
  description: z.string().max(2000).optional(),
  images: z.array(z.string().url("Invalid image URL")).optional(),
  latitude: z.number().min(-90).max(90).optional(),
  longitude: z.number().min(-180).max(180).optional(),
  public: z.boolean().optional(),
  tags: z.array(z.string()).optional(),
});

export const updateSpotSchema = z.object({
  name: z.string().min(2).max(100).optional(),
  address: z.string().max(200).optional(),
  place: z.string().max(100).optional(),
  description: z.string().max(2000).optional(),
  images: z.array(z.string().url("Invalid image URL")).optional(),
  latitude: z.number().min(-90).max(90).optional(),
  longitude: z.number().min(-180).max(180).optional(),
  public: z.boolean().optional(),
  active: z.boolean().optional(),
  tags: z.array(z.string()).optional(),
});
