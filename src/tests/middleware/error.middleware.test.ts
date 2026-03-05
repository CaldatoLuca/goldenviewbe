import { describe, it, expect, vi } from "vitest";
import { errorHandler } from "../../middleware/error.middleware.js";
import { AppError } from "../../utils/AppError.js";

vi.mock("../../utils/logger.js", () => ({
  default: {
    info: vi.fn(),
    error: vi.fn(),
    warn: vi.fn(),
  },
}));

const makeReqResNext = () => {
  const req = {} as any;
  const res = {
    status: vi.fn().mockReturnThis(),
    json: vi.fn().mockReturnThis(),
  } as any;
  const next = vi.fn();
  return { req, res, next };
};

describe("errorHandler middleware", () => {
  it("dovrebbe rispondere con status e messaggio per AppError", () => {
    const { req, res, next } = makeReqResNext();
    const err = new AppError("Non trovato", 404);

    errorHandler(err, req, res, next);

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      error: { message: "Non trovato", status: 404 },
    });
  });

  it("dovrebbe rispondere 500 per errori generici non AppError", () => {
    const { req, res, next } = makeReqResNext();
    const err = new Error("Errore generico");

    errorHandler(err, req, res, next);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      error: { message: "Errore interno del server", status: 500 },
    });
  });

  it("dovrebbe rispondere 500 per errori con status non definito", () => {
    const { req, res, next } = makeReqResNext();
    const err = { message: "qualcosa" }; // non è un Error

    errorHandler(err, req, res, next);

    expect(res.status).toHaveBeenCalledWith(500);
  });

  it("dovrebbe gestire AppError 401 Unauthorized", () => {
    const { req, res, next } = makeReqResNext();
    const err = new AppError("Unauthorized", 401);

    errorHandler(err, req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      error: { message: "Unauthorized", status: 401 },
    });
  });
});
