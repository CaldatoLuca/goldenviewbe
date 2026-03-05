import { describe, it, expect } from "vitest";
import { AppError } from "../../utils/AppError.js";

describe("AppError", () => {
  it("dovrebbe creare un errore con messaggio e status personalizzato", () => {
    const err = new AppError("Not found", 404);
    expect(err.message).toBe("Not found");
    expect(err.status).toBe(404);
  });

  it("dovrebbe avere status 500 come default", () => {
    const err = new AppError("Errore interno");
    expect(err.status).toBe(500);
  });

  it("dovrebbe essere istanza di Error", () => {
    const err = new AppError("Test", 400);
    expect(err).toBeInstanceOf(Error);
    expect(err).toBeInstanceOf(AppError);
  });

  it("dovrebbe propagare correttamente in un throw/catch", () => {
    expect(() => {
      throw new AppError("Unauthorized", 401);
    }).toThrow("Unauthorized");
  });
});
