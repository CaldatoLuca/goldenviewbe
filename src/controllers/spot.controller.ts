import type { NextFunction, Request, Response } from "express";
import { spotService } from "../services/spot.service.js";

export const getAll = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const spots = await spotService.findMany({});

    if (!spots.length) {
      return res
        .status(404)
        .json({ success: false, message: "No Spots found" });
    }

    res.status(200).json({
      success: true,
      total: spots.length,
      spots: spots,
    });
  } catch (error: any) {
    next(error);
  }
};
