import type { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

/**
 * JWT authentication middleware.
 * Verifies the Bearer token in the Authorization header.
 * Skips auth if JWT_SECRET is not configured (development mode).
 */
export function createAuthGuard(secret: string) {
  return (req: Request, res: Response, next: NextFunction): void => {
    // Skip auth if no secret configured (development mode)
    if (!secret) {
      next();
      return;
    }

    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith("Bearer ")) {
      res.status(401).json({ error: "Missing or invalid Authorization header" });
      return;
    }

    const token = authHeader.slice(7);

    try {
      const payload = jwt.verify(token, secret);
      (req as Request & { user: unknown }).user = payload;
      next();
    } catch {
      res.status(401).json({ error: "Invalid or expired token" });
    }
  };
}
