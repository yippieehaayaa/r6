export type ApiErrorResponse = {
  error: string;
  message: string;
  details?: Record<string, unknown>;
};
