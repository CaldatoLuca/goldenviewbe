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
      return res.status(404).json({ success: false, message: "No tags found" });
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
    const tag = await tagService.update({
      where: { id: req.params.id },
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
    await tagService.delete({ where: { id: req.params.id } });

    res.status(200).json({ success: true, message: "Tag deleted" });
  } catch (error: any) {
    next(error);
  }
};
