import { BaseService } from "./base.service.js";
import prisma from "../config/prisma.js";

export class SpotService extends BaseService<typeof prisma.spot> {
  constructor() {
    super(prisma.spot);
  }
}

export const spotService = new SpotService();
