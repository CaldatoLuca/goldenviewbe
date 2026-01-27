import { userService } from "./user.service.js";
import { AppError } from "../utils/AppError.js";
import { genSalt, hash, compare } from "bcrypt-ts";
import { tokenService } from "./token.services.js";

export class AuthService {
  async register(data: { email: string; password: string; username: string }) {
    const existing = await userService.findByEmail(data.email);
    if (existing) {
      throw new AppError("User already exists", 409);
    }

    const salt = await genSalt(10);
    const hashedPassword = data.password
      ? await hash(data.password, salt)
      : null;

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

    const accessToken = tokenService.generateAccessToken({ id: user.id });
    const refreshToken = tokenService.generateRefreshToken({ id: user.id });

    const refreshHash = await hash(refreshToken, 10);

    await userService.update({
      where: { id: user.id },
      data: {
        refreshToken: refreshHash,
      },
    });

    return { user, accessToken, refreshToken };
  }

  async login(data: { email: string; password?: string }) {
    const user = await userService.findByEmail(data.email);
    if (!user) {
      throw new AppError("Invalid credentials", 401);
    }

    if (user.password) {
      const validPassword = await compare(data.password || "", user.password);
      if (!validPassword) throw new AppError("Invalid credentials", 401);
    } else {
      // utente OAuth
      if (!data.password) {
        // login OAuth via backend
      } else {
        throw new AppError("User registered via OAuth, use OAuth login", 401);
      }
    }

    const accessToken = tokenService.generateAccessToken({ id: user.id });
    const refreshToken = tokenService.generateRefreshToken({ id: user.id });

    const refreshHash = await hash(refreshToken, 10);

    await userService.update({
      where: { id: user.id },
      data: {
        refreshToken: refreshHash,
      },
    });

    return { user, accessToken, refreshToken };
  }

  async refreshFromToken(refreshToken?: string) {
    if (!refreshToken) {
      throw new AppError("Refresh token missing", 401);
    }

    const payload = tokenService.verifyRefreshToken(refreshToken);

    const user = await userService.findById(payload.id);
    if (!user || !user.refreshToken) {
      throw new AppError("Unauthorized", 401);
    }

    const valid = await compare(refreshToken, user.refreshToken);
    if (!valid) {
      throw new AppError("Token reuse detected", 401);
    }

    const newAccessToken = tokenService.generateAccessToken({ id: user.id });
    const newRefreshToken = tokenService.generateRefreshToken({ id: user.id });

    const newRefreshHash = await hash(newRefreshToken, 10);

    await userService.update({
      where: { id: user.id },
      data: {
        refreshToken: newRefreshHash,
      },
    });

    return {
      accessToken: newAccessToken,
      refreshToken: newRefreshToken,
    };
  }
}

export const authService = new AuthService();
