import type { NextFunction, Request, Response } from "express";
import type { ZodType } from "zod";

export function validate(schema: ZodType) {
  return (req: Request, _res: Response, next: NextFunction) => {
    req.body = schema.parse(req.body);
    next();
  };
}

export function validateQuery(schema: ZodType) {
  return (req: Request, _res: Response, next: NextFunction) => {
    const parsed = schema.parse(req.query);
    Object.defineProperty(req, "query", {
      value: parsed,
      writable: true,
      configurable: true,
    });
    next();
  };
}
