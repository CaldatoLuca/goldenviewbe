import { BaseService } from "./base.service.js";
import prisma from "../config/prisma.js";
import { AppError } from "../utils/AppError.js";

export class SpotService extends BaseService<typeof prisma.spot> {
  constructor() {
    super(prisma.spot);
  }

  async findBySlug(slug: string) {
    const spot = await this.model.findUnique({
      where: { slug },
      include: { tags: true },
    });
    if (!spot) throw new AppError("Spot not found", 404);
    return spot;
  }

  async addTag(spotId: string, tagId: string) {
    return this.model.update({
      where: { id: spotId },
      data: { tags: { connect: { id: tagId } } },
      include: { tags: true },
    });
  }

  async removeTag(spotId: string, tagId: string) {
    return this.model.update({
      where: { id: spotId },
      data: { tags: { disconnect: { id: tagId } } },
      include: { tags: true },
    });
  }
}

export const spotService = new SpotService();
