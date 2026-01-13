import type { Response } from "express";

export const errorHandler = (err: any, res: Response) => {
  const status = err.status || 500;
  res.status(status).json({
    error: {
      message: err.message,
      status,
    },
  });
};
