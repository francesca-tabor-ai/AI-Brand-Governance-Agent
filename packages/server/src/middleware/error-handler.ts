import type { Request, Response, NextFunction } from "express";

export interface AppError extends Error {
  statusCode?: number;
}

/**
 * Global Express error handler.
 * Catches thrown errors and returns structured JSON responses.
 */
export function errorHandler(
  err: AppError,
  _req: Request,
  res: Response,
  _next: NextFunction,
): void {
  const statusCode = err.statusCode ?? 500;
  const message = statusCode === 500 ? "Internal server error" : err.message;

  console.error(`[ERROR] ${statusCode} ${err.message}`, err.stack);

  res.status(statusCode).json({
    error: message,
    statusCode,
  });
}
