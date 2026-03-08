import type { Request, Response, NextFunction } from "express";
import { userService } from "../services/user.service.js";
import { AppError } from "../utils/AppError.js";

/**
 * Requires the user to have verified their email.
 * Must be placed after authMiddleware (which sets req.userId).
 */
export const verifiedMiddleware = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const user = await userService.findById(req.userId!);

  if (!user?.emailVerified) {
    return next(new AppError("Email not verified", 403));
  }

  next();
};
