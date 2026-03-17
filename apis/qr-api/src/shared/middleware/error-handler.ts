import { Prisma } from "@prisma/client";
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

  if (error instanceof Prisma.PrismaClientInitializationError) {
    res.status(503).json({
      error: {
        message: "Database is unavailable",
        code: "DATABASE_UNAVAILABLE",
      },
    });
    return;
  }

  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    if (error.code === "P2002") {
      res.status(409).json({
        error: {
          message: "Resource already exists",
          code: "CONFLICT",
        },
      });
      return;
    }

    if (error.code === "P2025") {
      res.status(404).json({
        error: {
          message: "Resource was not found",
          code: "NOT_FOUND",
        },
      });
      return;
    }
  }

  console.error(error);
  res.status(500).json({
    error: {
      message: "Internal server error",
      code: "INTERNAL_SERVER_ERROR",
    },
  });
}
