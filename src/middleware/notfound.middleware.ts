import type { Request, Response, NextFunction } from "express";
import { AppError } from "../utils/AppError.js";

export const notFound = (req: Request, res: Response, next: NextFunction) => {
  const error = new AppError(`Route ${req.method} ${req.path} not found`, 404);
  next(error);
};
