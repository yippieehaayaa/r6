// Removed — Protected role guard removed; roles no longer exist.

import type { NextFunction, Request, Response } from "express";

export const requireNotTargetingProtectedRole =
  () => (_req: Request, _res: Response, next: NextFunction) =>
    next();
