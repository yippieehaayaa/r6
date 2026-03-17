import type { NextFunction, Request, Response } from "express";
import { ZodError } from "zod";
import { DomainError } from "../errors";

export function errorHandler(
  error: Error,
  _req: Request,
  res: Response,
  _next: NextFunction,
) {
  if (error instanceof DomainError) {
    res.status(error.httpStatus).json({
      error: {
        message: error.message,
        code: error.name,
      },
    });
    return;
  }

  if (error instanceof ZodError) {
    res.status(400).json({
      error: {
        message: "Validation failed",
        code: "VALIDATION_ERROR",
        details: error.issues,
      },
    });
    return;
  }

  console.error(error);
  res.status(500).json({
    error: {
      message: "Internal server error",
      code: "INTERNAL_SERVER_ERROR",
    },
  });
}
