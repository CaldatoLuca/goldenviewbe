import type { NextFunction, Request, Response } from "express";
import { spotService } from "../services/spot.service.js";

export const getAll = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const spots = await spotService.getAllPublic();

    if (!spots.length) {
      return res.status(404).json({ success: false, message: "No spots found" });
    }

    res.status(200).json({ success: true, total: spots.length, spots });
  } catch (error: any) {
    next(error);
  }
};

export const getAllAdmin = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const spots = await spotService.getAllAdmin();

    if (!spots.length) {
      return res.status(404).json({ success: false, message: "No spots found" });
    }

    res.status(200).json({ success: true, total: spots.length, spots });
  } catch (error: any) {
    next(error);
  }
};

export const getById = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { id } = req.params as { id: string };
    const spot = await spotService.findByIdWithRelations(id);
    res.status(200).json({ success: true, spot });
  } catch (error: any) {
    next(error);
  }
};

export const getBySlug = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { slug } = req.params as { slug: string };
    const spot = await spotService.findBySlug(slug);
    res.status(200).json({ success: true, spot });
  } catch (error: any) {
    next(error);
  }
};

export const getMySpots = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const spots = await spotService.getMySpots(req.userId!);

    res.status(200).json({ success: true, total: spots.length, spots });
  } catch (error: any) {
    next(error);
  }
};

export const create = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const spot = await spotService.createSpot(req.body, req.userId!);
    res.status(201).json({ success: true, spot });
  } catch (error: any) {
    next(error);
  }
};

export const update = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { id } = req.params as { id: string };
    const spot = await spotService.updateSpot(
      id,
      req.body,
      req.userId!,
      req.isAdmin ?? false,
    );
    res.status(200).json({ success: true, spot });
  } catch (error: any) {
    next(error);
  }
};

export const remove = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { id } = req.params as { id: string };
    await spotService.deleteSpot(id, req.userId!, req.isAdmin ?? false);
    res.status(200).json({ success: true, message: "Spot deleted" });
  } catch (error: any) {
    next(error);
  }
};

export const toggleActive = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { id } = req.params as { id: string };
    const spot = await spotService.toggleActive(id, req.userId!, req.isAdmin ?? false);
    res.status(200).json({ success: true, spot });
  } catch (error: any) {
    next(error);
  }
};

export const togglePublic = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { id } = req.params as { id: string };
    const spot = await spotService.togglePublic(id, req.userId!, req.isAdmin ?? false);
    res.status(200).json({ success: true, spot });
  } catch (error: any) {
    next(error);
  }
};
