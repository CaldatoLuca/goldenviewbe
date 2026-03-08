import { Router } from "express";
import { authMiddleware } from "../middleware/auth.middleware.js";
import { adminMiddleware } from "../middleware/admin.middleware.js";
import { setAdminMiddleware } from "../middleware/setAdmin.middleware.js";
import { validate } from "../middleware/validate.middleware.js";
import { createSpotSchema, updateSpotSchema } from "../schemas/spot.schemas.js";
import z from "zod/v3";
import {
  getAll,
  getAllAdmin,
  getById,
  getBySlug,
  getMySpots,
  getNearby,
  create,
  update,
  remove,
  toggleActive,
  togglePublic,
} from "../controllers/spot.controller.js";

const router = Router();

// ─── Public ──────────────────────────────────────────────────────────────────
router.get("/get-all", getAll);
router.get("/nearby", getNearby);
router.get("/slug/:slug", getBySlug);

// ─── Admin only ───────────────────────────────────────────────────────────────
router.get("/admin/all", authMiddleware, adminMiddleware, getAllAdmin);

// ─── Authenticated user ───────────────────────────────────────────────────────
router.get("/my-spots", authMiddleware, getMySpots);

router.post(
  "/",
  authMiddleware,
  validate(z.object({ body: createSpotSchema })),
  create,
);

// Routes that need owner OR admin check — setAdminMiddleware sets req.isAdmin
router.get("/:id", getById);

router.put(
  "/:id",
  authMiddleware,
  setAdminMiddleware,
  validate(z.object({ body: updateSpotSchema })),
  update,
);

router.delete("/:id", authMiddleware, setAdminMiddleware, remove);

router.patch("/:id/toggle-active", authMiddleware, setAdminMiddleware, toggleActive);

router.patch("/:id/toggle-public", authMiddleware, setAdminMiddleware, togglePublic);

export default router;
