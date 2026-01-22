import type { NextFunction, Request, Response } from "express";
import { authService } from "../services/auth.service.js";
import { userService } from "../services/user.service.js";
import { AppError } from "../utils/AppError.js";
import { genSalt, hash } from "bcrypt-ts";

interface RegisterBody {
  email: string;
  name: string;
  password: string;
}

export const register = async (
  req: Request<{}, {}, RegisterBody>,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { email, name, password } = req.body;

    const existing = await userService.findByEmail(email);
    if (existing) {
      throw new AppError("User already exists", 409);
    }

    const salt = await genSalt(10);
    const hashedPassword = await hash(password, salt);

    const user = await authService.register({
      email,
      name,
      password: hashedPassword,
    });

    res.status(200).json({
      success: true,
      user,
    });
  } catch (error: any) {
    next(error);
  }
};
