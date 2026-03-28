import axios from "axios";
import { env } from "@/config";

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

export default api;
