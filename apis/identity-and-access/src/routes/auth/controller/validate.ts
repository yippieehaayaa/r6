import type { NextFunction, Request, Response } from "express";
import { AppError } from "../../../lib/errors";
import { verifyAccessToken } from "../../../lib/jwt";
import { isAccessTokenRevoked } from "../../../lib/token-denylist";

// Service-to-service endpoint used by downstream microservices (e.g.
// inventory-and-catalog) to validate a Bearer token without having
// access to the RS256 private key.  The caller forwards the original
// Authorization header; this handler returns the decoded JWT claims.
export async function validate(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  const authHeader = req.header("Authorization");

  if (!authHeader?.startsWith("Bearer ")) {
    return next(
      new AppError(
        401,
        "unauthorized",
        "Missing or invalid Authorization header",
      ),
    );
  }

  const parts = authHeader.split(" ");

  if (parts[0] !== "Bearer" || !parts[1]) {
    return next(
      new AppError(
        401,
        "unauthorized",
        "Missing or invalid Authorization header",
      ),
    );
  }

  const token = parts[1];

  try {
    const payload = await verifyAccessToken(token);

    if (payload.jti && (await isAccessTokenRevoked(payload.jti))) {
      return next(new AppError(401, "token_revoked", "Token has been revoked"));
    }

    return res.status(200).json({ payload });
  } catch {
    return next(
      new AppError(401, "unauthorized", "Invalid or expired token"),
    );
  }
}
