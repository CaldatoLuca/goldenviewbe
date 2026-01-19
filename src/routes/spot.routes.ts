import { Router } from "express";
const router = Router();
import { getAll } from "../controllers/spot.controller.js";

router.get("/get-all", getAll);

export default router;
