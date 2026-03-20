import axios from 'axios';
import { toast } from "sonner";
import { env } from "@/config";

const api = axios.create({
	baseURL: env.API_URL,
	timeout: 30000,
	headers: {
		"Content-Type": "application/json",
	},
	withCredentials: true,
});