import z from "zod/v3";

export const createSpotSchema = z.object({
  name: z.string().min(1, "Name is required").max(100),
  address: z.string().optional(),
  place: z.string().optional(),
  description: z.string().optional(),
  images: z.array(z.string()).optional().default([]),
  latitude: z.number().optional(),
  longitude: z.number().optional(),
  public: z.boolean().optional(),
});

export const updateSpotSchema = createSpotSchema.partial();

export const addTagSchema = z.object({
  tagId: z.string().min(1, "Tag ID is required"),
});
