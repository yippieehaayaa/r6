// Removed — Elevated identity guard removed; roles no longer exist.

import type { NextFunction, Request, Response } from "express";

export const requireNotTargetingElevatedIdentity =
  () => (_req: Request, _res: Response, next: NextFunction) =>
    next();
