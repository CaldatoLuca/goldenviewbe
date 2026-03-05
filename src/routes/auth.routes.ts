import { Router } from "express";
import {
  register,
  login,
  logout,
  refresh,
} from "../controllers/auth.controller.js";
import { validate } from "../middleware/validate.middleware.js";
import { registerSchema, loginSchema } from "../schemas/auth.schemas.js";
import z from "zod/v3";
import rateLimit from "express-rate-limit";

const router = Router();

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, error: { message: "Too many requests, please try again later.", status: 429 } },
});

router.post(
  "/register",
  authLimiter,
  validate(z.object({ body: registerSchema })),
  register,
);

router.post("/login", authLimiter, validate(z.object({ body: loginSchema })), login);

router.post("/logout", logout);

router.post("/refresh", refresh);

export default router;
