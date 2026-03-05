import z from "zod/v3";

export const createTagSchema = z.object({
  name: z.string().min(1, "Name is required").max(50, "Name too long"),
});

export const updateTagSchema = z.object({
  name: z.string().min(1, "Name is required").max(50, "Name too long"),
});
