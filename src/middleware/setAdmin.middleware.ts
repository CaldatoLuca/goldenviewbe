import type { Request, Response, NextFunction } from "express";
import { userService } from "../services/user.service.js";

/**
 * Sets req.isAdmin = true if the authenticated user has ADMIN role.
 * Does NOT block the request — must be used after authMiddleware.
 */
export const setAdminMiddleware = async (
  req: Request,
  _res: Response,
  next: NextFunction,
) => {
  try {
    if (req.userId) {
      const user = await userService.findById(req.userId);
      req.isAdmin = user?.role === "ADMIN";
    }
    next();
  } catch {
    next();
  }
};
