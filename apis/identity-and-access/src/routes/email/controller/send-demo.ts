import { sendEmail } from "@r6/email";
import { redis } from "@r6/redis";
import type { NextFunction, Request, Response } from "express";
import { env } from "../../../config";

const DEMO_RECIPIENT = "joshdave900@gmail.com";
const IDEMPOTENCY_KEY = `email:demo:${DEMO_RECIPIENT}`;
const IDEMPOTENCY_TTL_SECONDS = 60;

export const sendDemo = async (
  _req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const alreadySent = await redis.exists(IDEMPOTENCY_KEY);

    if (alreadySent > 0) {
      res.status(409).json({
        error: {
          code: "email_recently_sent",
          message: "Email already sent recently. Please try again later.",
        },
      });
      return;
    }

    const result = await sendEmail({
      to: DEMO_RECIPIENT,
      subject: "r6 — Azure Communication Services Demo",
      senderAddress: env.AZURE_COMMUNICATION_SENDER_ADDRESS,
      html: `
        <html>
          <body>
            <h1>Hello from r6!</h1>
            <p>This is a demo email sent via Azure Communication Services.</p>
            <p>If you received this, the email integration is working correctly.</p>
          </body>
        </html>
      `,
      plainText:
        "Hello from r6! This is a demo email sent via Azure Communication Services. If you received this, the email integration is working correctly.",
    });

    await redis.set(IDEMPOTENCY_KEY, "1", {
      EX: IDEMPOTENCY_TTL_SECONDS,
    });

    res.status(200).json({
      messageId: result.messageId,
      status: result.status,
    });
  } catch (err) {
    next(err);
  }
};
