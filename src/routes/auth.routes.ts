import { Router } from "express";
const router = Router();
import { register } from "../controllers/auth.controller.js";
import { validate } from "../middleware/validate.js";
import { registerSchema } from "../services/auth.service.js";
import z from "zod/v3";

router.post(
  "/register",
  validate(z.object({ body: registerSchema })),
  register,
);

export default router;
