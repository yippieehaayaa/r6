import { Prisma } from "@r6/db-identity-and-access";
import type { ErrorRequestHandler } from "express";
import { ZodError } from "zod";
import { AppError } from "../../lib/errors";

export const errorHandler: ErrorRequestHandler = (err, _req, res, _next) => {
  if (err instanceof AppError) {
    return res.status(err.statusCode).json({
      error: err.code,
      message: err.message,
      ...(err.details !== undefined && { details: err.details }),
    });
  }

  // Duck-type fallback handles the case where two zod instances are resolved
  // (e.g. version drift between packages), causing instanceof to return false.
  const isZodError =
    err instanceof ZodError ||
    (err !== null &&
      typeof err === "object" &&
      (err as { name?: unknown }).name === "ZodError" &&
      Array.isArray((err as { issues?: unknown }).issues));

  if (isZodError) {
    const zodErr = err as ZodError;
    return res.status(400).json({
      error: "bad_request",
      message: "Request validation failed",
      details: zodErr.issues.map((issue) => ({
        path: issue.path.join("."),
        message: issue.message,
      })),
    });
  }

  if (err instanceof Prisma.PrismaClientKnownRequestError) {
    if (err.code === "P2002") {
      return res.status(409).json({
        error: "conflict",
        message: "Unique constraint violation",
      });
    }

    if (err.code === "P2025") {
      return res.status(404).json({
        error: "not_found",
        message: "Requested record was not found",
      });
    }

    // All other Prisma error codes (P2003 FK violations, P2000 value-too-long,
    // P2006 invalid value, etc.) must not expose raw field/column names.
    return res.status(500).json({
      error: "internal_server_error",
      message: "Internal server error",
    });
  }

  return res.status(500).json({
    error: "internal_server_error",
    message: "Internal server error",
  });
};
