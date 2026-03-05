import type { Request, Response, NextFunction } from "express";
import { userService } from "../services/user.service.js";
import { AppError } from "../utils/AppError.js";

export const adminMiddleware = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    if (!req.userId) {
      return next(new AppError("Unauthorized", 401));
    }

    const user = await userService.findById(req.userId);

    if (user.role !== "ADMIN") {
      return next(new AppError("Forbidden", 403));
    }

    next();
  } catch {
    return next(new AppError("Forbidden", 403));
  }
};
