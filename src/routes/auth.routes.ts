import { Router } from "express";
import { register, login } from "../controllers/auth.controller.js";
import { validate } from "../middleware/validate.js";
import { registerSchema, loginSchema } from "../schemas/auth.schemas.js";
import z from "zod/v3";

const router = Router();

router.post(
  "/register",
  validate(z.object({ body: registerSchema })),
  register,
);

router.post("/login", validate(z.object({ body: loginSchema })), login);

export default router;
