import type { NextFunction, Request, Response } from "express";
import type { ZodType } from "zod";

function assignRequestProperty<T>(
  req: Request,
  key: "body" | "query" | "params",
  value: T,
) {
  Object.defineProperty(req, key, {
    value,
    writable: true,
    configurable: true,
  });
}

export function validateBody(schema: ZodType) {
  return (req: Request, _res: Response, next: NextFunction) => {
    const parsed = schema.parse(req.body);
    assignRequestProperty(req, "body", parsed);
    next();
  };
}

export function validateQuery(schema: ZodType) {
  return (req: Request, _res: Response, next: NextFunction) => {
    const parsed = schema.parse(req.query);
    assignRequestProperty(req, "query", parsed);
    next();
  };
}

export function validateParams(schema: ZodType) {
  return (req: Request, _res: Response, next: NextFunction) => {
    const parsed = schema.parse(req.params);
    assignRequestProperty(req, "params", parsed);
    next();
  };
}
