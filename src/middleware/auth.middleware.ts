import type { Request, Response, NextFunction } from "express";
import { tokenService } from "../services/token.services.js";
import { AppError } from "../utils/AppError.js";

export const authMiddleware = (
  req: Request,
  _res: Response,
  next: NextFunction,
) => {
  const token = req.cookies?.accessToken;

  if (!token) {
    throw new AppError("Unauthorized", 401);
  }

  try {
    const payload = tokenService.verifyAccessToken(token);
    req.userId = payload.id;
    next();
  } catch {
    throw new AppError("Invalid or expired token", 401);
  }
};
