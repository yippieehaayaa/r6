import { isDatabaseReady } from "../../shared/persistence";

function timestamp(): string {
  return new Date().toISOString();
}

export interface ReadinessPayload {
  service: "dynamic-qr-api";
  status: "ready" | "degraded";
  checks: {
    database: "up" | "down";
  };
  timestamp: string;
}

export class HealthService {
  getLiveness(): {
    service: "dynamic-qr-api";
    status: "ok";
    timestamp: string;
  } {
    return {
      service: "dynamic-qr-api",
      status: "ok",
      timestamp: timestamp(),
    };
  }

  async getReadiness(): Promise<ReadinessPayload> {
    const databaseReady = await isDatabaseReady();

    return {
      service: "dynamic-qr-api",
      status: databaseReady ? "ready" : "degraded",
      checks: {
        database: databaseReady ? "up" : "down",
      },
      timestamp: timestamp(),
    };
  }
}

export const healthService = new HealthService();
