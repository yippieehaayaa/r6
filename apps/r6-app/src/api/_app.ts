import axios, {
	type AxiosError,
	type InternalAxiosRequestConfig,
} from "axios";
import { env } from "@/config";
import { getToken, setToken } from "@/api/token";
import { emitSessionExpired } from "@/api/session-events";

const api = axios.create({
	baseURL: env.API_URL,
	timeout: 30000,
	headers: {
		"Content-Type": "application/json",
	},
	withCredentials: true,
});

export const identityApi = axios.create({
	baseURL: `${env.API_URL}/identity-and-access`,
	timeout: 30000,
	headers: {
		"Content-Type": "application/json",
	},
	withCredentials: true,
});

export const inventoryApi = axios.create({
	baseURL: `${env.API_URL}/inventory-and-catalog`,
	timeout: 30000,
	headers: {
		"Content-Type": "application/json",
	},
	withCredentials: true,
});

function attachAuthInterceptors(
	instance: ReturnType<typeof axios.create>,
): void {
	instance.interceptors.request.use((config: InternalAxiosRequestConfig) => {
		const token = getToken();
		if (token) {
			config.headers.Authorization = `Bearer ${token}`;
		}
		return config;
	});

	instance.interceptors.response.use(
		(res) => res,
		async (error: AxiosError) => {
			const config = error.config as InternalAxiosRequestConfig & {
				_retry?: boolean;
			};
			const url = config?.url ?? "";

			if (
				error.response?.status !== 401 ||
				config?._retry ||
				url.includes("/auth/refresh") ||
				url.includes("/auth/login")
			) {
				return Promise.reject(error);
			}

			config._retry = true;
			try {
				const { data } = await axios.post<{ accessToken: string }>(
					`${env.API_URL}/identity-and-access/auth/refresh`,
					{},
					{ withCredentials: true },
				);
				setToken(data.accessToken);
				config.headers.Authorization = `Bearer ${data.accessToken}`;
				return instance(config);
			} catch {
				const staleToken = getToken();
				setToken(null);
				// Best-effort server-side logout: revoke the refresh token cookie
				// if we still hold a valid access token (e.g. network blip during refresh).
				if (staleToken) {
					axios
						.post(
							`${env.API_URL}/identity-and-access/auth/logout`,
							{},
							{
								withCredentials: true,
								headers: { Authorization: `Bearer ${staleToken}` },
							},
						)
						.catch(() => null);
				}
				emitSessionExpired();
				return Promise.reject(error);
			}
		},
	);
}

attachAuthInterceptors(identityApi);
attachAuthInterceptors(inventoryApi);

export default api;
