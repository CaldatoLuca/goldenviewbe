import prisma from "../config/prisma.js";
import { AppError } from "../utils/AppError.js";

export class SpotService {
  async getAll() {
    const spots = await prisma.spot.findMany();
    if (!spots) {
      throw new AppError("No Spots Founds", 404);
    }

    return spots;
  }
}
