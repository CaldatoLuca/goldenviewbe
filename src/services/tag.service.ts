import { BaseService } from "./base.service.js";
import prisma from "../config/prisma.js";

export class TagService extends BaseService<typeof prisma.tag> {
  constructor() {
    super(prisma.tag);
  }
}

export const tagService = new TagService();
