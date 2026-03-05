import type { Role } from "../generated/prisma/enums.js";

export interface JwtPayloadType {
  id: string;
  role: Role;
  [key: string]: any;
}
