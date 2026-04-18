import { emailClient } from "./client";

export type SendEmailOptions = {
  to: string;
  subject: string;
  senderAddress: string;
  html: string;
  plainText?: string;
};

export type SendEmailResult = {
  messageId: string;
  status: string;
};

export const sendEmail = async (
  options: SendEmailOptions,
): Promise<SendEmailResult> => {
  const { to, subject, senderAddress, html, plainText } = options;

  const message = {
    senderAddress,
    recipients: {
      to: [{ address: to }],
    },
    content: {
      subject,
      html,
      plainText: plainText ?? "",
    },
  };

  const poller = await emailClient.beginSend(message);
  const result = await poller.pollUntilDone();

  return {
    messageId: result.id ?? "",
    status: result.status,
  };
};
