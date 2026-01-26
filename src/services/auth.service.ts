import { userService } from "./user.service.js";
import { AppError } from "../utils/AppError.js";
import { genSalt, hash, compare } from "bcrypt-ts";

export class AuthService {
  async register(data: { email: string; password: string; username: string }) {
    const existing = await userService.findByEmail(data.email);
    if (existing) {
      throw new AppError("User already exists", 409);
    }

    const salt = await genSalt(10);
    const hashedPassword = await hash(data.password, salt);

    const user = await userService.create({
      data: {
        email: data.email,
        password: hashedPassword,
        username: data.username,
        role: "USER",
        image:
          "https://48zpjaa0fz.ufs.sh/f/3cZkC2bzvKBXIn0UYTMp6W3E0YAPlrsZ7IBHC1XagVxwUftD",
      },
    });

    return user;
  }

  async login(data: { email: string; password: string }) {
    const user = await userService.findByEmail(data.email);

    if (!user) {
      throw new AppError("Invalid credentials", 401);
    }

    if (!user.password) {
      throw new AppError("User registered via OAuth", 401);
    }

    const validPassword = await compare(data.password, user.password);
    if (!validPassword) {
      throw new AppError("Invalid credentials", 401);
    }

    return user;
  }
}

export const authService = new AuthService();
