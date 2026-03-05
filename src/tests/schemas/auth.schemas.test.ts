import { describe, it, expect } from "vitest";
import { registerSchema, loginSchema } from "../../schemas/auth.schemas.js";

describe("registerSchema", () => {
  it("dovrebbe passare con dati validi", () => {
    const result = registerSchema.safeParse({
      email: "user@example.com",
      password: "password123",
      username: "nomeutente",
    });
    expect(result.success).toBe(true);
  });

  it("dovrebbe fallire con email non valida", () => {
    const result = registerSchema.safeParse({
      email: "non-una-email",
      password: "password123",
      username: "nomeutente",
    });
    expect(result.success).toBe(false);
  });

  it("dovrebbe fallire con password troppo corta (< 8 char)", () => {
    const result = registerSchema.safeParse({
      email: "user@example.com",
      password: "corta",
      username: "nomeutente",
    });
    expect(result.success).toBe(false);
  });

  it("dovrebbe fallire con username troppo corto (< 3 char)", () => {
    const result = registerSchema.safeParse({
      email: "user@example.com",
      password: "password123",
      username: "ab",
    });
    expect(result.success).toBe(false);
  });

  it("dovrebbe fallire con username troppo lungo (> 30 char)", () => {
    const result = registerSchema.safeParse({
      email: "user@example.com",
      password: "password123",
      username: "a".repeat(31),
    });
    expect(result.success).toBe(false);
  });

  it("dovrebbe fallire con campi mancanti", () => {
    const result = registerSchema.safeParse({ email: "user@example.com" });
    expect(result.success).toBe(false);
  });
});

describe("loginSchema", () => {
  it("dovrebbe passare con dati validi", () => {
    const result = loginSchema.safeParse({
      email: "user@example.com",
      password: "qualsiasi",
    });
    expect(result.success).toBe(true);
  });

  it("dovrebbe fallire con email non valida", () => {
    const result = loginSchema.safeParse({
      email: "nonemial",
      password: "password",
    });
    expect(result.success).toBe(false);
  });

  it("dovrebbe fallire con password vuota", () => {
    const result = loginSchema.safeParse({
      email: "user@example.com",
      password: "",
    });
    expect(result.success).toBe(false);
  });

  it("dovrebbe fallire senza password", () => {
    const result = loginSchema.safeParse({ email: "user@example.com" });
    expect(result.success).toBe(false);
  });
});
