import type { NextFunction, Request, Response } from "express";
import { SpotService } from "../services/spot.service.js";

const spotService = new SpotService();

export const getAll = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const spots = await spotService.getAll();
    res.json(spots);
  } catch (err) {
    next(err);
  }
};
