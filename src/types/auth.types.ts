import type { User } from "../generated/prisma/client.js";

export interface RegisterRequest {
  email: string;
  username: string;
  password: string;
}

export interface RegisterResponse {
  success: boolean;
  user: User;
}
