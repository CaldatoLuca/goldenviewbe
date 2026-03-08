import { Router } from "express";
import {
  register,
  login,
  logout,
  refresh,
  verifyEmail,
  forgotPassword,
  resetPassword,
} from "../controllers/auth.controller.js";
import { validate } from "../middleware/validate.middleware.js";
import {
  registerSchema,
  loginSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
  verifyEmailSchema,
} from "../schemas/auth.schemas.js";
import z from "zod/v3";

const router = Router();

router.post(
  "/register",
  validate(z.object({ body: registerSchema })),
  register,
);

router.post("/login", validate(z.object({ body: loginSchema })), login);

router.post("/logout", logout);

router.post("/refresh", refresh);

router.post(
  "/verify-email",
  validate(z.object({ body: verifyEmailSchema })),
  verifyEmail,
);

router.post(
  "/forgot-password",
  validate(z.object({ body: forgotPasswordSchema })),
  forgotPassword,
);

router.post(
  "/reset-password",
  validate(z.object({ body: resetPasswordSchema })),
  resetPassword,
);

export default router;
