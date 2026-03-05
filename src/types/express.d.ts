import "express";
import type { Role } from "../generated/prisma/enums.js";

declare module "express-serve-static-core" {
  interface Request {
    userId?: string;
    userRole?: Role;
  }
}
