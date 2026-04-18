import { verifyEmail } from "@r6/db-identity-and-access";
import { redis } from "@r6/redis";
import { VerifyEmailRequestSchema } from "@r6/schemas";
import type { NextFunction, Request, Response } from "express";
import { AppError } from "../../../lib/errors";
import { toSafeIdentity } from "../helpers";

type EmailVerifyPayload = {
  code: string;
  identityId: string;
};

export async function verifyEmailHandler(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const { email, code } = VerifyEmailRequestSchema.parse(req.body);

    // Retrieve the pending OTP from Redis.
    const raw = await redis.get(`email:verify:${email}`);
    if (!raw) {
      throw new AppError(
        410,
        "verification_code_expired",
        "Verification code has expired or does not exist. Please register again.",
      );
    }

    const payload = JSON.parse(raw) as EmailVerifyPayload;

    // Constant-time string comparison is not strictly needed for short-lived
    // OTPs, but we reject early to give a clear error.
    if (code !== payload.code) {
      throw new AppError(
        400,
        "invalid_verification_code",
        "The verification code is incorrect.",
      );
    }

    // Mark the identity as email-verified and activate it.
    const updatedIdentity = await verifyEmail(payload.identityId);

    // Consume the OTP — prevent reuse.
    await redis.del(`email:verify:${email}`);

    res.status(200).json({
      owner: toSafeIdentity(updatedIdentity),
    });
  } catch (err) {
    next(err);
  }
}
