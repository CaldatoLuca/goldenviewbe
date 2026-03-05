import type { Request, Response, NextFunction } from "express";
import { AppError } from "../utils/AppError.js";

export const adminMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  if (!req.userRole) {
    return next(new AppError("Unauthorized", 401));
  }

  if (req.userRole !== "ADMIN") {
    return next(new AppError("Forbidden", 403));
  }

  next();
};
