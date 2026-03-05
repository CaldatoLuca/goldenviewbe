import type { NextFunction, Request, Response } from "express";
import { spotService } from "../services/spot.service.js";
import { AppError } from "../utils/AppError.js";
import { slugify } from "../utils/slugify.js";

export const getAll = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const spots = await spotService.findMany({ include: { tags: true } });

    if (!spots.length) {
      return next(new AppError("No spots found", 404));
    }

    res.status(200).json({
      success: true,
      total: spots.length,
      spots,
    });
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
    const spot = await spotService.findById(id);
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

export const create = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const slug = `${slugify(req.body.name)}-${Date.now()}`;
    const spot = await spotService.create({
      data: {
        ...req.body,
        slug,
        userId: req.userId ?? null,
      },
    });
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
    const spot = await spotService.findById(id);

    if (spot.userId !== req.userId && req.userRole !== "ADMIN") {
      return next(new AppError("Forbidden", 403));
    }

    const updated = await spotService.update({
      where: { id },
      data: req.body,
      include: { tags: true },
    });
    res.status(200).json({ success: true, spot: updated });
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
    const spot = await spotService.findById(id);

    if (spot.userId !== req.userId && req.userRole !== "ADMIN") {
      return next(new AppError("Forbidden", 403));
    }

    await spotService.delete({ where: { id } });
    res.status(200).json({ success: true, message: "Spot deleted" });
  } catch (error: any) {
    next(error);
  }
};

export const addTag = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { id } = req.params as { id: string };
    const spot = await spotService.addTag(id, req.body.tagId);
    res.status(200).json({ success: true, spot });
  } catch (error: any) {
    next(error);
  }
};

export const removeTag = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { id, tagId } = req.params as { id: string; tagId: string };
    const spot = await spotService.removeTag(id, tagId);
    res.status(200).json({ success: true, spot });
  } catch (error: any) {
    next(error);
  }
};
