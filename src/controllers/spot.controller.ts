import type { NextFunction, Request, Response } from "express";
import { spotService } from "../services/spot.service.js";
import { nearbyQuerySchema } from "../schemas/spot.schemas.js";

function parsePagination(query: Request["query"], defaultPageSize = 20) {
  const page = Math.max(1, parseInt(query.page as string) || 1);
  const pageSize = Math.min(100, Math.max(1, parseInt(query.pageSize as string) || defaultPageSize));
  return { page, pageSize };
}

export const getAll = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { page, pageSize } = parsePagination(req.query);
    const result = await spotService.getAllPublic(page, pageSize);

    if (!result.total) {
      return res.status(404).json({ success: false, message: "No spots found" });
    }

    res.status(200).json({ success: true, ...result });
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
    const { page, pageSize } = parsePagination(req.query);
    const result = await spotService.getAllAdmin(page, pageSize);

    if (!result.total) {
      return res.status(404).json({ success: false, message: "No spots found" });
    }

    res.status(200).json({ success: true, ...result });
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
    const { page, pageSize } = parsePagination(req.query);
    const result = await spotService.getMySpots(req.userId!, page, pageSize);
    res.status(200).json({ success: true, ...result });
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

export const getNearby = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const parsed = nearbyQuerySchema.safeParse(req.query);
    if (!parsed.success) {
      return res.status(400).json({ success: false, error: { message: "Invalid query parameters", issues: parsed.error.issues } });
    }
    const { lat, lon, radius, page, pageSize } = parsed.data;
    const result = await spotService.getNearby(lat, lon, radius, page, pageSize);

    if (!result.total) {
      return res.status(404).json({ success: false, message: "No spots found within the given radius" });
    }

    res.status(200).json({
      success: true,
      center: { lat, lon },
      radiusKm: radius,
      ...result,
    });
  } catch (error: any) {
    next(error);
  }
};
