import { Router } from "express";
import { me, updateMe } from "../controllers/user.controller.js";
import { authMiddleware } from "../middleware/auth.middleware.js";
import { validate } from "../middleware/validate.middleware.js";
import { updateMeSchema } from "../schemas/user.schemas.js";
import z from "zod/v3";

const router = Router();

router.get("/me", authMiddleware, me);
router.patch("/me", authMiddleware, validate(z.object({ body: updateMeSchema })), updateMe);

export default router;
