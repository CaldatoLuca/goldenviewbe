import type { NextFunction, Request, Response } from "express";
import type { AnyZodObject } from "zod/v3";

export const validate =
  (schema: AnyZodObject) =>
  (req: Request, res: Response, next: NextFunction) => {
    try {
      schema.parse({
        body: req.body,
        params: req.params,
        query: req.query,
      });

      next();
    } catch (err) {
      return res.status(400).json(err);
    }
  };
