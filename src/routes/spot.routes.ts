import { Router } from "express";
import {
  getAll,
  getById,
  getBySlug,
  create,
  update,
  remove,
  addTag,
  removeTag,
} from "../controllers/spot.controller.js";
import { authMiddleware } from "../middleware/auth.middleware.js";
import { adminMiddleware } from "../middleware/admin.middleware.js";
import { validate } from "../middleware/validate.middleware.js";
import { createSpotSchema, updateSpotSchema, addTagSchema } from "../schemas/spot.schemas.js";
import z from "zod/v3";

const router = Router();

router.get("/get-all", getAll);
router.get("/slug/:slug", getBySlug);
router.get("/:id", getById);
router.post("/", authMiddleware, validate(z.object({ body: createSpotSchema })), create);
router.put("/:id", authMiddleware, validate(z.object({ body: updateSpotSchema })), update);
router.delete("/:id", authMiddleware, remove);
router.post("/:id/tags", authMiddleware, adminMiddleware, validate(z.object({ body: addTagSchema })), addTag);
router.delete("/:id/tags/:tagId", authMiddleware, adminMiddleware, removeTag);

export default router;
