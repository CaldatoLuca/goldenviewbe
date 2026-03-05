import { describe, it, expect, vi } from "vitest";
import { validate } from "../../middleware/validate.middleware.js";
import z from "zod/v3";

const makeReqResNext = (body = {}, params = {}, query = {}) => {
  const req = { body, params, query } as any;
  const res = {
    status: vi.fn().mockReturnThis(),
    json: vi.fn().mockReturnThis(),
  } as any;
  const next = vi.fn();
  return { req, res, next };
};

describe("validate middleware", () => {
  const schema = z.object({
    body: z.object({
      email: z.string().email(),
      password: z.string().min(8),
    }),
    params: z.object({}),
    query: z.object({}),
  });

  it("dovrebbe chiamare next() con body valido", () => {
    const { req, res, next } = makeReqResNext({
      email: "test@example.com",
      password: "password123",
    });

    validate(schema)(req, res, next);

    expect(next).toHaveBeenCalledOnce();
    expect(next).toHaveBeenCalledWith(); // no error
    expect(res.status).not.toHaveBeenCalled();
  });

  it("dovrebbe restituire 400 con body non valido", () => {
    const { req, res, next } = makeReqResNext({
      email: "non-una-email",
      password: "corta",
    });

    validate(schema)(req, res, next);

    expect(next).not.toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalled();
  });

  it("dovrebbe restituire 400 con body vuoto", () => {
    const { req, res, next } = makeReqResNext({});

    validate(schema)(req, res, next);

    expect(next).not.toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(400);
  });

  it("dovrebbe restituire 400 se manca un campo obbligatorio", () => {
    const { req, res, next } = makeReqResNext({
      email: "test@example.com",
      // password mancante
    });

    validate(schema)(req, res, next);

    expect(next).not.toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(400);
  });
});
