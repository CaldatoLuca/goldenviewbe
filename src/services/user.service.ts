import prisma from "../config/prisma.js";
import { BaseService } from "./base.service.js";

export class UserService extends BaseService<typeof prisma.user> {
  constructor() {
    super(prisma.user);
  }

  async findByEmail(email: string) {
    return this.model.findUnique({
      where: { email },
    });
  }
}

export const userService = new UserService();
