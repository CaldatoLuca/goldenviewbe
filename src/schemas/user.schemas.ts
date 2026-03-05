import z from "zod/v3";

export const updateMeSchema = z.object({
  username: z.string().min(3, "Username too short").max(30).optional(),
  image: z.string().url("Invalid image URL").optional(),
});
