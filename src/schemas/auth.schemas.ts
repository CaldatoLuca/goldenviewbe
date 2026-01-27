import z from "zod/v3";

export const registerSchema = z.object({
  email: z.string().email("Email not correct"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  username: z.string().min(3, "Username too short").max(30),
});

export const loginSchema = z.object({
  email: z.string().email("Email not correct"),
  password: z.string().min(1, "Password required"),
});
