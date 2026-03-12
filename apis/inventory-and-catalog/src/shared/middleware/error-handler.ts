import type { NextFunction, Request, Response } from "express";
import { ZodError } from "zod";
import { DomainError } from "../errors";

export function errorHandler(
  err: Error,
  _req: Request,
  res: Response,
  _next: NextFunction,
) {
  if (err instanceof DomainError) {
    res.status(err.httpStatus).json({ message: err.message });
    return;
  }

  if (err instanceof ZodError) {
    res.status(400).json({ message: "Validation failed", issues: err.issues });
    return;
  }

  console.error(err);
  res.status(500).json({ message: "Internal server error" });
}
