import { disableTotp } from "@r6/db-identity-and-access";
import type { NextFunction, Request, Response } from "express";
import { AppError } from "../../../lib/errors";

export async function disableTotpHandler(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    if (typeof req.jwtPayload?.sub !== "string") {
      throw new AppError(401, "unauthorized", "Authentication required");
    }

    await disableTotp(req.jwtPayload.sub);

    res.status(200).json({ message: "TOTP disabled successfully" });
  } catch (error) {
    next(error);
  }
}
