import { Router } from "express";
const router = Router();
import { register } from "../controllers/auth.controller.js";

router.post("/register", register);

export default router;
