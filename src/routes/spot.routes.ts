import { Router } from "express";
const router = Router();
import { getNonActiveSpots } from "../controllers/spot.controller.js";

router.get("/non-active", getNonActiveSpots);

export default router;
