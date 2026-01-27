import { AppError } from "../utils/AppError.js";
import jwtPkg from "jsonwebtoken";
const jwt = jwtPkg as typeof import("jsonwebtoken");
import { config } from "../config/env.js";
import type { JwtPayloadType } from "../types/jwt.types.js";

const ACCESS_TOKEN_EXPIRE = "15m";
const REFRESH_TOKEN_EXPIRE = "30d";

const ACCESS_SECRET = config.jwtAccess;
const REFRESH_SECRET = config.jwtRefresh;

export class TokenService {
  generateAccessToken(payload: JwtPayloadType) {
    return jwt.sign(payload, ACCESS_SECRET, { expiresIn: ACCESS_TOKEN_EXPIRE });
  }

  generateRefreshToken(payload: JwtPayloadType) {
    return jwt.sign(payload, REFRESH_SECRET, {
      expiresIn: REFRESH_TOKEN_EXPIRE,
    });
  }

  verifyAccessToken(token: string): JwtPayloadType {
    const decoded = jwt.verify(token, ACCESS_SECRET);

    if (typeof decoded === "string") {
      throw new AppError("Invalid token payload", 401);
    }

    return decoded as JwtPayloadType;
  }

  verifyRefreshToken(token: string): JwtPayloadType {
    const decoded = jwt.verify(token, REFRESH_SECRET);

    if (typeof decoded === "string") {
      throw new AppError("Invalid token payload", 401);
    }

    return decoded as JwtPayloadType;
  }
}

export const tokenService = new TokenService();
