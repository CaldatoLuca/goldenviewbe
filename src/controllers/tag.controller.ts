import type { NextFunction, Request, Response } from "express";
import { tagService } from "../services/tag.service.js";
import { AppError } from "../utils/AppError.js";

export const getAll = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const tags = await tagService.findMany({});

    if (!tags.length) {
      return next(new AppError("No tags found", 404));
    }

    res.status(200).json({
      success: true,
      total: tags.length,
      tags,
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
    const tag = await tagService.findById(id);

    res.status(200).json({ success: true, tag });
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
    const tag = await tagService.create({ data: req.body });

    res.status(201).json({ success: true, tag });
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
    const tag = await tagService.update({
      where: { id },
      data: req.body,
    });

    res.status(200).json({ success: true, tag });
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
    await tagService.delete({ where: { id } });

    res.status(200).json({ success: true, message: "Tag deleted" });
  } catch (error: any) {
    next(error);
  }
};
