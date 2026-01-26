import type { Request, Response, NextFunction } from "express";
import { tokenService } from "../services/token.services.js";
import type { JwtPayloadType } from "../types/jwt.types.js";

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
    if (!authHeader)
      return res.status(401).json({ success: false, message: "Unauthorized" });

    const parts = authHeader.split(" ");
    if (parts.length !== 2 || !parts[1])
      return res.status(401).json({ success: false, message: "Unauthorized" });

    const token = parts[1];
    const payload = tokenService.verifyAccessToken(token);

    req.user = payload;
    next();
  } catch (err) {
    return res.status(401).json({ success: false, message: "Unauthorized" });
  }
};
