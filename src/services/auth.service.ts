import { userService } from "./user.service.js";
import z from "zod/v3";

export const registerSchema = z.object({
  email: z.string().email("Email not correct"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  username: z.string().min(3, "Username too short").max(30),
});

export class AuthService {
  async register(data: { email: string; password: string; username: string }) {
    const user = await userService.create({
      data: {
        email: data.email,
        password: data.password,
        username: data.username,
        role: "USER",
        image:
          "https://48zpjaa0fz.ufs.sh/f/3cZkC2bzvKBXIn0UYTMp6W3E0YAPlrsZ7IBHC1XagVxwUftD",
      },
    });

    return user;
  }
}

export const authService = new AuthService();
