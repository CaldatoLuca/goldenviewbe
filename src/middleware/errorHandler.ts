import type { Request, Response, NextFunction } from "express";
import { AppError } from "../utils/AppError.js";
import Logger from "../utils/logger.js";

export function errorHandler(
  err: any,
  req: Request,
  res: Response,
  next: NextFunction
) {
  Logger.error(err);

  if (err instanceof AppError) {
    return res.status(err.status).json({
      success: false,
      error: {
        message: err.message,
        status: err.status,
      },
    });
  }

  res.status(500).json({
    success: false,
    error: {
      message: "Errore interno del server",
      status: 500,
    },
  });
}
