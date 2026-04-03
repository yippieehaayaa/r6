import type { AxiosError } from "axios";

type ApiError = {
	error: string;
	message: string;
	details?: Record<string, unknown>;
};

type ParsedApiError = {
	code: string;
	message: string;
	details?: Record<string, unknown>;
};

export function parseApiError(err: unknown): ParsedApiError {
	const axiosErr = err as AxiosError<ApiError>;
	const data = axiosErr.response?.data;
	return {
		code: data?.error ?? "unknown_error",
		message:
			data?.message ?? (err as Error).message ?? "An unexpected error occurred",
		details: data?.details,
	};
}

export function getApiErrorMessage(err: unknown): string {
	return parseApiError(err).message;
}
