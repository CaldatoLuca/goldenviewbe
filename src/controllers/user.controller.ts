import type { Request, Response, NextFunction } from "express";
import { userService } from "../services/user.service.js";
import { AppError } from "../utils/AppError.js";

export const me = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.userId;

    if (!userId) {
      throw new AppError("Unauthorized", 401);
    }

    const user = await userService.findById(userId);

    if (!user) {
      throw new AppError("User not found", 404);
    }

    res.status(200).json({
      success: true,
      user,
    });
  } catch (error) {
    next(error);
  }
};
