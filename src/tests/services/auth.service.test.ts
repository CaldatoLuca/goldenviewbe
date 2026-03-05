import { describe, it, expect, vi, beforeEach } from "vitest";
import { AppError } from "../../utils/AppError.js";

// Mock prisma prima di importare i servizi che lo usano
vi.mock("../../config/prisma.js", () => ({
  default: {
    user: {
      findUnique: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
    },
  },
}));

// Mock logger per evitare output nei test
vi.mock("../../utils/logger.js", () => ({
  default: {
    info: vi.fn(),
    error: vi.fn(),
    warn: vi.fn(),
  },
}));

const { userService } = await import("../../services/user.service.js");
const { authService } = await import("../../services/auth.service.js");

const mockUser = {
  id: "uuid-123",
  email: "test@example.com",
  password: "$2b$10$hashedpassword",
  username: "testuser",
  role: "USER",
  image: "https://example.com/avatar.png",
  refreshToken: null,
  createdAt: new Date(),
  updatedAt: new Date(),
};

describe("AuthService", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("register", () => {
    it("dovrebbe lanciare 409 se l'email è già in uso", async () => {
      vi.spyOn(userService, "findByEmail").mockResolvedValue(mockUser as any);

      await expect(
        authService.register({
          email: "test@example.com",
          password: "password123",
          username: "testuser",
        })
      ).rejects.toThrow(AppError);

      await expect(
        authService.register({
          email: "test@example.com",
          password: "password123",
          username: "testuser",
        })
      ).rejects.toMatchObject({ status: 409 });
    });

    it("dovrebbe creare un utente e restituire tokens", async () => {
      vi.spyOn(userService, "findByEmail").mockResolvedValue(null);
      vi.spyOn(userService, "create").mockResolvedValue({
        ...mockUser,
        id: "new-uuid",
      } as any);
      vi.spyOn(userService, "update").mockResolvedValue({} as any);

      const result = await authService.register({
        email: "nuovo@example.com",
        password: "password123",
        username: "nuovoutente",
      });

      expect(result).toHaveProperty("user");
      expect(result).toHaveProperty("accessToken");
      expect(result).toHaveProperty("refreshToken");
      expect(typeof result.accessToken).toBe("string");
      expect(typeof result.refreshToken).toBe("string");
    });
  });

  describe("login", () => {
    it("dovrebbe lanciare 401 se l'utente non esiste", async () => {
      vi.spyOn(userService, "findByEmail").mockResolvedValue(null);

      await expect(
        authService.login({ email: "nonesiste@example.com", password: "pass" })
      ).rejects.toMatchObject({ status: 401 });
    });

    it("dovrebbe lanciare 401 con password errata", async () => {
      // bcrypt hash di "correctpassword"
      const { hash, genSalt } = await import("bcrypt-ts");
      const salt = await genSalt(10);
      const correctHash = await hash("correctpassword", salt);

      vi.spyOn(userService, "findByEmail").mockResolvedValue({
        ...mockUser,
        password: correctHash,
      } as any);

      await expect(
        authService.login({ email: "test@example.com", password: "wrongpassword" })
      ).rejects.toMatchObject({ status: 401 });
    });

    it("dovrebbe restituire tokens con credenziali corrette", async () => {
      const { hash, genSalt } = await import("bcrypt-ts");
      const salt = await genSalt(10);
      const correctHash = await hash("password123", salt);

      vi.spyOn(userService, "findByEmail").mockResolvedValue({
        ...mockUser,
        password: correctHash,
      } as any);
      vi.spyOn(userService, "update").mockResolvedValue({} as any);

      const result = await authService.login({
        email: "test@example.com",
        password: "password123",
      });

      expect(result).toHaveProperty("accessToken");
      expect(result).toHaveProperty("refreshToken");
      expect(result.user.email).toBe("test@example.com");
    });

    it("utente OAuth senza password non dovrebbe richiedere password", async () => {
      vi.spyOn(userService, "findByEmail").mockResolvedValue({
        ...mockUser,
        password: null,
      } as any);
      vi.spyOn(userService, "update").mockResolvedValue({} as any);

      // login OAuth non passa password
      const result = await authService.login({ email: "oauth@example.com" });
      expect(result).toHaveProperty("accessToken");
    });

    it("utente OAuth con password dovrebbe lanciare 401", async () => {
      vi.spyOn(userService, "findByEmail").mockResolvedValue({
        ...mockUser,
        password: null,
      } as any);

      await expect(
        authService.login({ email: "oauth@example.com", password: "qualcosa" })
      ).rejects.toMatchObject({ status: 401 });
    });
  });

  describe("refreshFromToken", () => {
    it("dovrebbe lanciare 401 se il refresh token è assente", async () => {
      await expect(authService.refreshFromToken(undefined)).rejects.toMatchObject({
        status: 401,
      });
    });

    it("dovrebbe lanciare errore per un token non valido", async () => {
      await expect(
        authService.refreshFromToken("token.non.valido")
      ).rejects.toThrow();
    });
  });
});
