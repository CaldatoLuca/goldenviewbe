import type { NextFunction, Request, Response } from "express";
import { SpotService } from "../services/spot.service.js";

const spotService = new SpotService();

export const getNonActiveSpots = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const spots = await spotService.findMany({});

    res.status(200).json({
      success: true,
      spots,
    });
  } catch (error: any) {
    next(error);
  }
};
