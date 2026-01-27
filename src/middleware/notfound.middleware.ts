import type { Request, Response, NextFunction } from "express";

export const notFound = (req: Request, res: Response, next: NextFunction) => {
  const error = new Error(`Route ${req.method} ${req.path} not found`) as any;
  error.status = 404;
  next(error);
};
