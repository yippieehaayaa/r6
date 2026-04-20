import { EmailClient } from "@azure/communication-email";

export type { EmailClient };

export const createEmailClient = (connectionString: string): EmailClient => {
  return new EmailClient(connectionString);
};

const connectionString =
  process.env.AZURE_COMMUNICATION_CONNECTION_STRING ?? "";

export const emailClient = createEmailClient(connectionString);
