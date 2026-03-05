import { Router } from "express";
import { validate } from "../middleware/validate.middleware.js";
import { createTagSchema, updateTagSchema } from "../schemas/tag.schemas.js";
import {
  getAll,
  getById,
  create,
  update,
  remove,
} from "../controllers/tag.controller.js";
import z from "zod/v3";

const router = Router();

router.get("/get-all", getAll);
router.get("/:id", getById);
router.post("/", validate(z.object({ body: createTagSchema })), create);
router.put("/:id", validate(z.object({ body: updateTagSchema })), update);
router.delete("/:id", remove);

export default router;
