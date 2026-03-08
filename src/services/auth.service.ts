import { userService } from "./user.service.js";
import { AppError } from "../utils/AppError.js";
import { genSalt, hash, compare } from "bcrypt-ts";
import { tokenService } from "./token.services.js";
import { emailService } from "./email.service.js";
import crypto from "crypto";

/** Generate a secure random hex token and its bcrypt hash. */
async function generateToken(): Promise<{ raw: string; hashed: string }> {
  const raw = crypto.randomBytes(32).toString("hex");
  const hashed = await hash(raw, 10);
  return { raw, hashed };
}

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

    const { raw: verifyRaw, hashed: verifyHashed } = await generateToken();
    const verifyExpiry = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24h

    const user = await userService.create({
      data: {
        email: data.email,
        password: hashedPassword,
        username: data.username,
        role: "USER",
        image:
          "https://48zpjaa0fz.ufs.sh/f/3cZkC2bzvKBXIn0UYTMp6W3E0YAPlrsZ7IBHC1XagVxwUftD",
        emailVerifyToken: verifyHashed,
        emailVerifyExpiry: verifyExpiry,
      },
    });

    const accessToken = tokenService.generateAccessToken({ id: user.id });
    const refreshToken = tokenService.generateRefreshToken({ id: user.id });

    const refreshHash = await hash(refreshToken, 10);

    await userService.update({
      where: { id: user.id },
      data: { refreshToken: refreshHash },
    });

    // Fire-and-forget – don't fail registration if email sending fails
    emailService
      .sendVerificationEmail(data.email, verifyRaw)
      .catch(console.error);

    return { user, accessToken, refreshToken };
  }

  async verifyEmail(token: string) {
    // We must find users whose token has not expired, then compare hashes
    const users = await userService.findMany({
      where: {
        emailVerifyToken: { not: null },
        emailVerifyExpiry: { gt: new Date() },
        emailVerified: null,
      },
    });

    let matched: (typeof users)[number] | null = null;
    for (const u of users) {
      if (!u.emailVerifyToken) continue;
      const ok = await compare(token, u.emailVerifyToken);
      if (ok) {
        matched = u;
        break;
      }
    }

    if (!matched) {
      throw new AppError("Invalid or expired verification link", 400);
    }

    await userService.update({
      where: { id: matched.id },
      data: {
        emailVerified: new Date(),
        emailVerifyToken: null,
        emailVerifyExpiry: null,
      },
    });
  }

  async forgotPassword(email: string) {
    const user = await userService.findByEmail(email);
    // Always resolve silently to avoid user enumeration
    if (!user) return;

    const { raw, hashed } = await generateToken();
    const expiry = new Date(Date.now() + 60 * 60 * 1000); // 1h

    await userService.update({
      where: { id: user.id },
      data: {
        passwordResetToken: hashed,
        passwordResetExpiry: expiry,
      },
    });

    emailService
      .sendPasswordResetEmail(email, raw)
      .catch(console.error);
  }

  async resetPassword(token: string, newPassword: string) {
    const users = await userService.findMany({
      where: {
        passwordResetToken: { not: null },
        passwordResetExpiry: { gt: new Date() },
      },
    });

    let matched: (typeof users)[number] | null = null;
    for (const u of users) {
      if (!u.passwordResetToken) continue;
      const ok = await compare(token, u.passwordResetToken);
      if (ok) {
        matched = u;
        break;
      }
    }

    if (!matched) {
      throw new AppError("Invalid or expired reset link", 400);
    }

    const salt = await genSalt(10);
    const hashedPassword = await hash(newPassword, salt);

    await userService.update({
      where: { id: matched.id },
      data: {
        password: hashedPassword,
        passwordResetToken: null,
        passwordResetExpiry: null,
        // Invalidate all sessions on password reset
        refreshToken: null,
      },
    });
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
      data: { refreshToken: refreshHash },
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
      data: { refreshToken: newRefreshHash },
    });

    return {
      accessToken: newAccessToken,
      refreshToken: newRefreshToken,
    };
  }
}

export const authService = new AuthService();
