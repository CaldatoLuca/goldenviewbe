import type { Request, Response, NextFunction } from "express";
import { tokenService } from "../services/token.services.js";
import { AppError } from "../utils/AppError.js";
import { authService } from "../services/auth.service.js";

export const authMiddleware = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const accessToken = req.cookies?.accessToken;
  const refreshToken = req.cookies?.refreshToken;

  if (!accessToken && !refreshToken) {
    return next(new AppError("Unauthorized", 401));
  }

  try {
    const payload = tokenService.verifyAccessToken(accessToken);
    req.userId = payload.id;
    next();
  } catch {
    try {
      if (!refreshToken) {
        throw new AppError("Unauthorized", 401);
      }

      const tokens = await authService.refreshFromToken(refreshToken);

      res.cookie("accessToken", tokens.accessToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
        maxAge: 15 * 60 * 1000,
      });

      res.cookie("refreshToken", tokens.refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
        maxAge: 30 * 24 * 60 * 60 * 1000,
      });

      const payload = tokenService.verifyAccessToken(tokens.accessToken);
      req.userId = payload.id;
      next();
    } catch {
      return next(new AppError("Unauthorized", 401));
    }
  }
};
