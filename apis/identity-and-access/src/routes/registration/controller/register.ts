import { createIdentity } from "@r6/db-identity-and-access";
import { sendEmail } from "@r6/email";
import { redis } from "@r6/redis";
import { RegisterSchema } from "@r6/schemas";
import type { NextFunction, Request, Response } from "express";
import { env } from "../../../config";
import { EMAIL_VERIFY_TTL_SECONDS, generateOtp } from "../helpers";

export async function register(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const {
      username,
      email,
      password,
      firstName,
      middleName,
      lastName,
      country,
    } = RegisterSchema.parse(req.body);

    // Create the identity without a tenant yet.
    // tenantId will be set later when the user creates or joins a tenant.
    // Throws P2002 if email or username already exists globally → 409 via errorHandler.
    const identity = await createIdentity({
      username,
      email,
      password,
      firstName,
      middleName: middleName ?? null,
      lastName,
      country,
      tenantId: null,
    });

    const code = generateOtp();

    // Store the OTP alongside the identity id needed at verify-email time.
    await redis.set(
      `email:verify:${email}`,
      JSON.stringify({ code, identityId: identity.id }),
      { EX: EMAIL_VERIFY_TTL_SECONDS },
    );

    // Send the verification email via Azure Communication Services.
    await sendEmail({
      to: email,
      subject: "Verify your email — r6",
      senderAddress: env.AZURE_COMMUNICATION_SENDER_ADDRESS,
      html: `
				<html>
					<body style="font-family: sans-serif; max-width: 480px; margin: 0 auto; padding: 32px;">
						<h1 style="font-size: 24px; margin-bottom: 8px;">Verify your email</h1>
						<p>Thanks for signing up, <strong>${username}</strong>.</p>
						<p>Use the code below to complete your registration. It expires in <strong>10 minutes</strong>.</p>
						<div style="font-size: 36px; font-weight: bold; letter-spacing: 8px; padding: 24px 0; text-align: center;">
							${code}
						</div>
						<p style="color: #6b7280; font-size: 14px;">
							If you did not create an account, you can safely ignore this email.
						</p>
					</body>
				</html>
			`,
      plainText: `Your r6 verification code is: ${code}\n\nThis code expires in 10 minutes.`,
    });

    // Do not reveal identity details until email is verified.
    res.status(201).json({
      message:
        "Registration started. Please check your inbox for a verification code.",
    });
  } catch (err) {
    next(err);
  }
}
