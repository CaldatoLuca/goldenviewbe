import { describe, it, expect, beforeEach } from "vitest";
import { TokenService } from "../../services/token.services.js";
import { AppError } from "../../utils/AppError.js";

describe("TokenService", () => {
  let tokenService: TokenService;

  beforeEach(() => {
    tokenService = new TokenService();
  });

  describe("generateAccessToken / verifyAccessToken", () => {
    it("dovrebbe generare e verificare un access token valido", () => {
      const payload = { id: "user-123" };
      const token = tokenService.generateAccessToken(payload);

      expect(typeof token).toBe("string");
      expect(token.split(".")).toHaveLength(3); // JWT format

      const decoded = tokenService.verifyAccessToken(token);
      expect(decoded.id).toBe("user-123");
    });

    it("dovrebbe lanciare AppError per un access token non valido", () => {
      expect(() => {
        tokenService.verifyAccessToken("token.non.valido");
      }).toThrow();
    });

    it("dovrebbe lanciare errore per un access token firmato con secret sbagliato", () => {
      // token firmato con il refresh secret, non l'access secret
      const payload = { id: "user-123" };
      const refreshToken = tokenService.generateRefreshToken(payload);

      expect(() => {
        tokenService.verifyAccessToken(refreshToken);
      }).toThrow();
    });
  });

  describe("generateRefreshToken / verifyRefreshToken", () => {
    it("dovrebbe generare e verificare un refresh token valido", () => {
      const payload = { id: "user-456" };
      const token = tokenService.generateRefreshToken(payload);

      expect(typeof token).toBe("string");

      const decoded = tokenService.verifyRefreshToken(token);
      expect(decoded.id).toBe("user-456");
    });

    it("dovrebbe lanciare errore per un refresh token non valido", () => {
      expect(() => {
        tokenService.verifyRefreshToken("token.non.valido");
      }).toThrow();
    });

    it("i token access e refresh dovrebbero essere diversi", () => {
      const payload = { id: "user-789" };
      const access = tokenService.generateAccessToken(payload);
      const refresh = tokenService.generateRefreshToken(payload);

      expect(access).not.toBe(refresh);
    });
  });
});
