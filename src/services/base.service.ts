import { Prisma } from "../generated/prisma/client.js";
import { AppError } from "../utils/AppError.js";
import {
  ERROR_MAP,
  PrismaErrorCode,
  type operationT,
} from "../utils/errorMap.prisma.js";

type PrismaDelegate = {
  findUnique: (args: any) => any;
  findFirst: (args: any) => any;
  findMany: (args: any) => any;
  create: (args: any) => any;
  update: (args: any) => any;
  delete: (args: any) => any;
  count: (args: any) => any;
};

export class BaseService<T extends PrismaDelegate> {
  constructor(protected model: T) {}

  private getModelName(): string {
    const modelName = this.model.constructor.name;
    return modelName;
  }

  private handleError(error: any, operation: operationT): never {
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      const handler = ERROR_MAP[error.code as PrismaErrorCode];
      if (handler) {
        throw handler(
          operation,
          error?.meta || {
            target: "record",
            model: this.getModelName(),
          },
        );
      }
      throw new AppError(`Database error: ${error.message}`, 500);
    }
    throw new AppError(
      `Unexpected error: ${error.message || "Unknown error occurred."}`,
      500,
    );
  }

  async findById(id: string) {
    try {
      const record = await this.model.findUnique({
        where: { id },
      } as Parameters<T["findUnique"]>[0]);

      if (!record) {
        throw new AppError("Record not found", 404);
      }

      return record;
    } catch (error) {
      this.handleError(error, "read");
    }
  }

  async findUnique(args: Parameters<T["findUnique"]>) {
    try {
      const record = await this.model.findUnique(args);

      if (!record) {
        throw new AppError("Record not found", 404);
      }

      return record;
    } catch (error) {
      this.handleError(error, "read");
    }
  }

  async findMany(args: Parameters<T["findMany"]>[0]) {
    try {
      return this.model.findMany(args);
    } catch (error) {
      this.handleError(error, "read");
    }
  }

  async create(args: Parameters<T["create"]>[0]) {
    try {
      return this.model.create(args);
    } catch (error) {
      this.handleError(error, "create");
    }
  }

  async update(args: Parameters<T["update"]>[0]) {
    try {
      return this.model.update(args);
    } catch (error) {
      this.handleError(error, "update");
    }
  }

  async delete(args: Parameters<T["delete"]>[0]) {
    try {
      return this.model.delete(args);
    } catch (error) {
      this.handleError(error, "delete");
    }
  }

  async paginate(
    args: Parameters<T["findMany"]>[0] & { page: number; pageSize: number },
  ) {
    const { page, pageSize, ...query } = args;

    return this.model.findMany({
      ...query,
      skip: (page - 1) * pageSize,
      take: pageSize,
    });
  }
}
