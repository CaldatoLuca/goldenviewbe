import { AppError } from "./AppError.js";

export const PrismaErrorCode = Object.freeze({
  P2000: "P2000",
  P2001: "P2001",
  P2002: "P2002",
  P2003: "P2003",
  P2006: "P2006",
  P2007: "P2007",
  P2008: "P2008",
  P2009: "P2009",
  P2010: "P2010",
  P2011: "P2011",
  P2012: "P2012",
  P2014: "P2014",
  P2015: "P2015",
  P2016: "P2016",
  P2017: "P2017",
  P2018: "P2018",
  P2019: "P2019",
  P2021: "P2021",
  P2023: "P2023",
  P2025: "P2025",
  P2031: "P2031",
  P2033: "P2033",
  P2034: "P2034",
  P2037: "P2037",
  P1000: "P1000",
  P1001: "P1001",
  P1002: "P1002",
  P1015: "P1015",
  P1017: "P1017",
});

export type PrismaErrorCode = keyof typeof PrismaErrorCode;

interface PrismaErrorMeta {
  target?: string;
  model?: string;
  relationName?: string;
  details?: string;
}

export type operationT = "create" | "read" | "update" | "delete";

export type PrismaErrorHandler = (
  operation: operationT,
  meta?: PrismaErrorMeta,
) => Error;

export const ERROR_MAP: Record<PrismaErrorCode, PrismaErrorHandler> = {
  P2000: (_operation, meta) =>
    new AppError(
      `The provided value for ${meta?.target || "a field"} is too long. Please use a shorter value.`,
      400,
    ),

  P2001: (operation, meta) =>
    new AppError(
      `The ${meta?.model || "record"} you are trying to ${operation} could not be found.`,
      404,
    ),

  P2002: (operation, meta) => {
    const field = meta?.target || "unique field";
    switch (operation) {
      case "create":
        return new AppError(
          `A record with the same ${field} already exists. Please use a different value.`,
          409,
        );
      case "update":
        return new AppError(
          `The new value for ${field} conflicts with an existing record.`,
          409,
        );
      default:
        return new AppError(`Unique constraint violation on ${field}.`, 409);
    }
  },

  P2003: (operation) =>
    new AppError(
      `Foreign key constraint failed. Unable to ${operation} the record because related data is invalid or missing.`,
      400,
    ),

  P2006: (_operation, meta) =>
    new AppError(
      `The provided value for ${meta?.target || "a field"} is invalid. Please correct it.`,
      400,
    ),

  P2007: (operation) =>
    new AppError(
      `Data validation error during ${operation}. Please ensure all inputs are valid and try again.`,
      500,
    ),

  P2008: (operation) =>
    new AppError(
      `Failed to query the database during ${operation}. Please try again later.`,
      500,
    ),

  P2009: (operation) =>
    new AppError(
      `Invalid data fetched during ${operation}. Check query structure.`,
      500,
    ),

  P2010: () =>
    new AppError(
      `Invalid raw query. Ensure your query is correct and try again.`,
      500,
    ),

  P2011: (_operation, meta) =>
    new AppError(
      `The required field ${meta?.target || "a field"} is missing. Please provide it to continue.`,
      400,
    ),

  P2012: (operation, meta) =>
    new AppError(
      `Missing required relation ${meta?.relationName || ""}. Ensure all related data exists before ${operation}.`,
      400,
    ),

  P2014: (operation) => {
    switch (operation) {
      case "create":
        return new AppError(
          `Cannot create record because the referenced data does not exist. Ensure related data exists.`,
          400,
        );
      case "delete":
        return new AppError(
          `Unable to delete record because it is linked to other data. Update or delete dependent records first.`,
          400,
        );
      default:
        return new AppError(`Foreign key constraint error.`);
        400;
    }
  },

  P2015: () =>
    new AppError(
      `A record with the required ID was expected but not found. Please retry.`,
      500,
    ),

  P2016: (operation) =>
    new AppError(
      `Query ${operation} failed because the record could not be fetched. Ensure the query is correct.`,
      500,
    ),

  P2017: (operation) =>
    new AppError(
      `Connected records were not found for ${operation}. Check related data.`,
      500,
    ),

  P2018: () =>
    new AppError(
      `The required connection could not be established. Please check relationships.`,
      500,
    ),

  P2019: (_operation, meta) =>
    new AppError(
      `Invalid input for ${meta?.details || "a field"}. Please ensure data conforms to expectations.`,
      500,
    ),

  P2021: (_operation, meta) =>
    new AppError(
      `The ${meta?.model || "model"} was not found in the database.`,
      500,
    ),

  P2023: (_operation, meta) =>
    new AppError(
      `The value you are trying to use for this ${meta?.model || "record"} is not compatible with the Databse colum settings`,
      400,
    ),

  P2025: (operation, meta) =>
    new AppError(
      `The ${meta?.model || "record"} you are trying to ${operation} does not exist. It may have been deleted.`,
      404,
    ),

  P2031: () =>
    new AppError(
      `Invalid Prisma Client initialization error. Please check configuration.`,
      500,
    ),

  P2033: (operation) =>
    new AppError(
      `Insufficient database write permissions for ${operation}.`,
      500,
    ),

  P2034: (operation) =>
    new AppError(
      `Database read-only transaction failed during ${operation}.`,
      500,
    ),

  P2037: (operation) =>
    new AppError(
      `Unsupported combinations of input types for ${operation}. Please correct the query or input.`,
      500,
    ),

  P1000: () =>
    new AppError(
      `Database authentication failed. Verify your credentials and try again.`,
      500,
    ),

  P1001: () =>
    new AppError(
      `The database server could not be reached. Please check its availability.`,
      500,
    ),

  P1002: () =>
    new AppError(
      `Connection to the database timed out. Verify network connectivity and server availability.`,
      500,
    ),

  P1015: (operation) =>
    new AppError(
      `Migration failed. Unable to complete ${operation}. Check migration history or database state.`,
      500,
    ),

  P1017: () =>
    new AppError(
      `Database connection failed. Ensure the database is online and credentials are correct.`,
      500,
    ),
};
