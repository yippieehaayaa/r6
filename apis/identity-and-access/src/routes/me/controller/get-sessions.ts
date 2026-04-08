import { listActiveSessionsForIdentity } from "@r6/db-identity-and-access";
import type { NextFunction, Request, Response } from "express";
import { AppError } from "../../../lib/errors";

const toSafeSession = ({
  jti,
  userAgent,
  ipAddress,
  expiresAt,
  createdAt,
}: Awaited<ReturnType<typeof listActiveSessionsForIdentity>>[number]) => ({
  jti,
  userAgent,
  ipAddress,
  expiresAt,
  createdAt,
});

export async function getSessions(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    if (typeof req.jwtPayload?.sub !== "string") {
      throw new AppError(401, "unauthorized", "Authentication required");
    }

    const sessions = await listActiveSessionsForIdentity(req.jwtPayload.sub);

    res.status(200).json(sessions.map(toSafeSession));
  } catch (error) {
    next(error);
  }
}
