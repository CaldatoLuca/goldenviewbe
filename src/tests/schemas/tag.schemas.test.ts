import { describe, it, expect } from "vitest";
import { createTagSchema, updateTagSchema } from "../../schemas/tag.schemas.js";

describe("createTagSchema", () => {
  it("dovrebbe passare con nome valido", () => {
    const result = createTagSchema.safeParse({ name: "panorama" });
    expect(result.success).toBe(true);
  });

  it("dovrebbe fallire con nome vuoto", () => {
    const result = createTagSchema.safeParse({ name: "" });
    expect(result.success).toBe(false);
  });

  it("dovrebbe fallire con nome troppo lungo (> 50 char)", () => {
    const result = createTagSchema.safeParse({ name: "a".repeat(51) });
    expect(result.success).toBe(false);
  });

  it("dovrebbe fallire senza campo name", () => {
    const result = createTagSchema.safeParse({});
    expect(result.success).toBe(false);
  });

  it("dovrebbe accettare un nome di esattamente 50 caratteri", () => {
    const result = createTagSchema.safeParse({ name: "a".repeat(50) });
    expect(result.success).toBe(true);
  });
});

describe("updateTagSchema", () => {
  it("dovrebbe passare con nome valido", () => {
    const result = updateTagSchema.safeParse({ name: "montagna" });
    expect(result.success).toBe(true);
  });

  it("dovrebbe fallire con nome vuoto", () => {
    const result = updateTagSchema.safeParse({ name: "" });
    expect(result.success).toBe(false);
  });

  it("dovrebbe fallire con nome troppo lungo", () => {
    const result = updateTagSchema.safeParse({ name: "b".repeat(51) });
    expect(result.success).toBe(false);
  });
});
