import { userService } from "./user.service.js";
import dayjs from "dayjs";

export class AuthService {
  async register(data: { email: string; password: string; name: string }) {
    const user = await userService.create({
      data: {
        email: data.email,
        password: data.password,
        name: data.name,
        role: "USER",
        emailVerified: dayjs().toDate(),
      },
    });

    return user;
  }
}

export const authService = new AuthService();
