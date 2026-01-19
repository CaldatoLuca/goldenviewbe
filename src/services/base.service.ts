import { Prisma } from "../generated/prisma/client.js";
import type {
  Operations,
  DelegateArgs,
  DelegateReturnTypes,
  DataArgs,
  WhereArgs,
} from "../types/base.type.js";
import { AppError } from "../utils/AppError.js";
import {
  ERROR_MAP,
  type operationT,
  PrismaErrorCode,
} from "../utils/errorMap.prisma.js";
/**
 * BaseService provides a generic CRUD interface for a prisma model.
 * It enables common data operations such as find, create, update, and delete.
 *
 * @template D - Type for the model delegate, defining available operations.
 * @template A - Arguments for the model delegate's operations.
 * @template R - Return types for the model delegate's operations.
 */
export class BaseService<
  D extends { [K in Operations]: (...args: any[]) => any },
  A extends DelegateArgs<D>,
  R extends DelegateReturnTypes<D>,
> {
  /**
   * Initializes the BaseService with the specified model.
   * @param model - The Prisma model delegate for database operations.
   */

  constructor(protected model: D) {}

  /**
   * Retrieves the name of the model dynamically.
   * @returns {string} - The name of the model.
   */
  private getModelName(): string {
    const modelName = this.model.constructor.name;
    return modelName;
  }
  /**
   * Error handling helper function
   */
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

  /**
   * Finds a unique record by given criteria.
   * @param args - Arguments to find a unique record.
   * @returns {Promise<R['findUnique']>} - A promise resolving to the found record.
   * @example
   * const user = await service.findUnique({ where: { id: 'user_id' } });
   */
  async findUnique(args: A["findUnique"]): Promise<R["findUnique"]> {
    try {
      return this.model.findUnique(args as any) as Promise<R["findUnique"]>;
    } catch (error) {
      this.handleError(error, "read");
    }
  }

  /**
   * Finds the first record matching the given criteria.
   * @param args - Arguments to find the first matching record.
   * @returns {Promise<R['findFirst']>} - A promise resolving to the first matching record.
   * @example
   * const firstUser = await service.findFirst({ where: { name: 'John' } });
   */
  async findFirst(args: A["findFirst"]): Promise<R["findFirst"]> {
    try {
      return this.model.findFirst(args as any) as Promise<R["findFirst"]>;
    } catch (error) {
      this.handleError(error, "read");
    }
  }

  /**
   * Finds a record by its ID.
   * @param id - The ID of the record to find.
   * @param args - Optional additional arguments for the find operation.
   * @returns {Promise<R['findFirst']>} - A promise resolving to the found record.
   * @throws {NotFoundException} - If no record is found with the given ID.
   * @example
   * const user = await service.findById('user_id');
   */
  async findById(id: string, args?: A["findFirst"]): Promise<R["findFirst"]> {
    try {
      const record = (await this.model.findFirst({
        where: { id },
        ...(args || {}),
      })) as R["findFirst"];
      if (!record) {
        throw new AppError(`Record with ID ${id} not found.`);
        404;
      }
      return record;
    } catch (error) {
      this.handleError(error, "read");
    }
  }

  /**
   * Finds multiple records matching the given criteria.
   * @param args - Arguments to find multiple records.
   * @returns {Promise<R['findMany']>} - A promise resolving to the list of found records.
   * @example
   * const users = await service.findMany({ where: { isActive: true } });
   */
  async findMany(args: A["findMany"]): Promise<R["findMany"]> {
    try {
      return this.model.findMany(args as any) as Promise<R["findMany"]>;
    } catch (error) {
      this.handleError(error, "read");
    }
  }

  /**
   * Creates a new record with the given data.
   * @param args - Arguments to create a record.
   * @returns {Promise<R['create']>} - A promise resolving to the created record.
   * @example
   * const newUser = await service.create({ data: { name: 'John Doe' } });
   */
  async create(args: A["create"]): Promise<R["create"]> {
    try {
      return this.model.create(args as any) as Promise<R["create"]>;
    } catch (error) {
      this.handleError(error, "create");
    }
  }

  /**
   * Creates multiple new records with the given data.
   * @param args - Arguments to create multiple records.
   * @returns {Promise<R['createMany']>} - A promise resolving to the created records.
   * @example
   * const newUsers = await service.createMany({ data: [{ name: 'John' }, { name: 'Jane' }] });
   */
  async createMany(args: A["createMany"]): Promise<R["createMany"]> {
    try {
      return this.model.createMany(args as any) as Promise<R["createMany"]>;
    } catch (error) {
      this.handleError(error, "create");
    }
  }

  /**
   * Updates a record with the given data.
   * @param args - Arguments to update a record.
   * @returns {Promise<R['update']>} - A promise resolving to the updated record.
   * @example
   * const updatedUser = await service.update({ where: { id: 'user_id' }, data: { name: 'John' } });
   */
  async update(args: A["update"]): Promise<R["update"]> {
    try {
      return this.model.update(args as any) as Promise<R["update"]>;
    } catch (error) {
      this.handleError(error, "update");
    }
  }

  /**
   * Updates a record by ID with the given data.
   * @param id - The ID of the record to update.
   * @param data - The data to update the record with.
   * @returns {Promise<R['update']>} - A promise resolving to the updated record.
   * @example
   * const updatedUser = await service.updateById('user_id', { name: 'John Doe' });
   */
  async updateById(
    id: string,
    data: DataArgs<A["update"]>,
  ): Promise<R["update"]> {
    try {
      return (await this.model.update({
        where: { id },
        data: data as any,
      })) as R["update"];
    } catch (error) {
      this.handleError(error, "update");
    }
  }

  /**
   * Deletes a record by ID.
   * @param id - The ID of the record to delete.
   * @returns {Promise<R['delete']>} - A promise resolving to the deleted record.
   * @example
   * const deletedUser = await service.deleteById('user_id');
   */
  async deleteById(id: string): Promise<R["delete"]> {
    try {
      return (await this.model.delete({
        where: { id },
      })) as R["delete"];
    } catch (error) {
      this.handleError(error, "delete");
    }
  }

  /**
   * Deletes a record based on the given criteria.
   * @param args - Arguments to delete a record.
   * @returns {Promise<R['delete']>} - A promise resolving to the deleted record.
   * @example
   * const deletedUser = await service.delete({ where: { name: 'John' } });
   */
  async delete(args: A["delete"]): Promise<R["delete"]> {
    try {
      return this.model.delete(args as any) as Promise<R["delete"]>;
    } catch (error) {
      this.handleError(error, "delete");
    }
  }

  /**
   * Creates or updates a record based on the given criteria.
   * @param args - Arguments to upsert a record.
   * @returns {Promise<R['upsert']>} - A promise resolving to the created or updated record.
   * @example
   * const user = await service.upsert({ where: { id: 'user_id' }, create: { name: 'John' }, update: { name: 'Johnny' } });
   */
  async upsert(args: A["upsert"]): Promise<R["upsert"]> {
    try {
      return this.model.upsert(args as any) as Promise<R["upsert"]>;
    } catch (error) {
      this.handleError(error, "create");
    }
  }

  /**
   * Counts the number of records matching the given criteria.
   * @param args - Arguments to count records.
   * @returns {Promise<R['count']>} - A promise resolving to the count.
   * @example
   * const userCount = await service.count({ where: { isActive: true } });
   */
  async count(args: A["count"]): Promise<R["count"]> {
    try {
      return this.model.count(args as any) as Promise<R["count"]>;
    } catch (error) {
      this.handleError(error, "read");
    }
  }

  /**
   * Aggregates records based on the given criteria.
   * @param args - Arguments to aggregate records.
   * @returns {Promise<R['aggregate']>} - A promise resolving to the aggregation result.
   * @example
   * const userAggregates = await service.aggregate({ _count: true });
   */
  async aggregate(args: A["aggregate"]): Promise<R["aggregate"]> {
    try {
      return this.model.aggregate(args as any) as Promise<R["aggregate"]>;
    } catch (error) {
      this.handleError(error, "read");
    }
  }

  /**
   * Deletes multiple records based on the given criteria.
   * @param args - Arguments to delete multiple records.
   * @returns {Promise<R['deleteMany']>} - A promise resolving to the result of the deletion.
   * @example
   * const deleteResult = await service.deleteMany({ where: { isActive: false } });
   */
  async deleteMany(args: A["deleteMany"]): Promise<R["deleteMany"]> {
    try {
      return this.model.deleteMany(args as any) as Promise<R["deleteMany"]>;
    } catch (error) {
      this.handleError(error, "delete");
    }
  }

  /**
   * Updates multiple records based on the given criteria.
   * @param args - Arguments to update multiple records.
   * @returns {Promise<R['updateMany']>} - A promise resolving to the result of the update.
   * @example
   * const updateResult = await service.updateMany({ where: { isActive: true }, data: { isActive: false } });
   */
  async updateMany(args: A["updateMany"]): Promise<R["updateMany"]> {
    try {
      return this.model.updateMany(args as any) as Promise<R["updateMany"]>;
    } catch (error) {
      this.handleError(error, "update");
    }
  }

  /**
   * Finds a record by unique criteria or creates it if not found.
   * @param args - Arguments to find or create a record.
   * @returns {Promise<R['findUnique'] | R['create']>} - A promise resolving to the found or created record.
   * @example
   * const user = await service.findOrCreate({ where: { email: 'john@example.com' }, create: { email: 'john@example.com', name: 'John' } });
   */
  async findOrCreate(args: {
    where: WhereArgs<A["findUnique"]>;
    create: DataArgs<A["create"]>;
  }): Promise<R["findUnique"] | R["create"]> {
    try {
      const existing = (await this.model.findUnique({
        where: args.where,
      } as any)) as R["findUnique"];
      if (existing) {
        return existing;
      }
      return this.model.create({ data: args.create } as any) as Promise<
        R["create"]
      >;
    } catch (error) {
      this.handleError(error, "create");
    }
  }

  /**
   * Checks if a record exists based on the given criteria.
   * @param where - The criteria to check for existence.
   * @returns {Promise<boolean>} - A promise resolving to true if the record exists, false otherwise.
   * @example
   * const exists = await service.exists({ email: 'john@example.com' });
   */
  async exists(where: WhereArgs<A["findUnique"]>): Promise<boolean> {
    try {
      const count = (await this.model.count({ where } as any)) as number;
      return count > 0;
    } catch (error) {
      this.handleError(error, "read");
    }
  }

  /**
   * Soft deletes a record by setting `isDeleted` to true.
   * @param id - The ID of the record to soft delete.
   * @param data - Additional data to update on soft delete.
   * @returns {Promise<R['update']>} - A promise resolving to the updated record.
   * @example
   * const softDeletedUser = await service.softDeleteById('user_id', { reason: 'User requested deletion' });
   */
  async softDeleteById(
    id: string,
    data: Partial<DataArgs<A["update"]>>,
  ): Promise<R["update"]> {
    try {
      return this.model.update({
        where: { id },
        data: { ...data, isDeleted: true } as any,
      }) as Promise<R["update"]>;
    } catch (error) {
      this.handleError(error, "delete");
    }
  }

  /**
   * Restores a soft-deleted record by setting `isDeleted` to false.
   * @param id - The ID of the record to restore.
   * @param data - Additional data to update on restore.
   * @returns {Promise<R['update']>} - A promise resolving to the updated record.
   * @example
   * const restoredUser = await service.restoreById('user_id', { reason: 'User requested restoration' });
   */
  async restoreById(
    id: string,
    data: Partial<DataArgs<A["update"]>>,
  ): Promise<R["update"]> {
    try {
      return this.model.update({
        where: { id },
        data: { ...data, isDeleted: false } as any,
      }) as Promise<R["update"]>;
    } catch (error) {
      this.handleError(error, "update");
    }
  }

  /**
   * Finds multiple records with pagination.
   * @param args - Arguments including page, pageSize, and optional filters.
   * @returns {Promise<R['findMany']>} - A promise resolving to the paginated list of records.
   * @example
   * const users = await service.findManyWithPagination({ page: 1, pageSize: 10, where: { isActive: true } });
   */
  async findManyWithPagination(args: {
    page: number;
    pageSize: number;
    where?: WhereArgs<A["findUnique"]>;
  }): Promise<R["findMany"]> {
    const { page, pageSize, where } = args;
    try {
      return this.model.findMany({
        where,
        skip: (page - 1) * pageSize,
        take: pageSize,
      } as any) as Promise<R["findMany"]>;
    } catch (error) {
      this.handleError(error, "read");
    }
  }
}
