import type { Request, Response, NextFunction } from "express";
import { tokenService } from "../services/token.services.js";
import type { JwtPayloadType } from "../types/jwt.types.js";
import { AppError } from "../utils/AppError.js";

export interface AuthRequest extends Request {
  user?: JwtPayloadType;
}

export const authMiddleware = (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader) throw new AppError("Unauthorized", 401);

    const parts = authHeader.split(" ");
    if (parts.length !== 2 || !parts[1])
      throw new AppError("Unauthorized", 401);

    const token = parts[1];
    const payload = tokenService.verifyAccessToken(token);

    req.user = payload;
    next();
  } catch (err) {
    next(err);
  }
};
