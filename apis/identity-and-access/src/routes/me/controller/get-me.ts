import { getIdentityById } from "@r6/db-identity-and-access";
import type { NextFunction, Request, Response } from "express";
import { AppError } from "../../../lib/errors";
import { toSafeIdentity } from "../helpers";

export async function getMe(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    if (typeof req.jwtPayload?.sub !== "string") {
      throw new AppError(401, "unauthorized", "Authentication required");
    }

    const identity = await getIdentityById(req.jwtPayload.sub);
    if (!identity) {
      throw new AppError(404, "not_found", "Identity not found");
    }

    res.status(200).json(toSafeIdentity(identity));
  } catch (error) {
    next(error);
  }
}
