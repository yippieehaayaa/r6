import type { LoginRequestInput } from "@r6/schemas";
import { createContext, useContext, useEffect, useRef, useState } from "react";
import { loginFn } from "@/api/auth/mutations/login";
import { logoutFn } from "@/api/auth/mutations/logout";
import { refreshFn } from "@/api/auth/mutations/refresh";
import { getToken, setToken } from "@/api/token";

type AuthStatus = "loading" | "authenticated" | "unauthenticated";

export interface AuthContext {
	status: AuthStatus;
	isAuthenticated: boolean;
	login: (input: LoginRequestInput) => Promise<void>;
	logout: () => Promise<void>;
}

const AuthCtx = createContext<AuthContext | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
	const [status, setStatus] = useState<AuthStatus>("loading");
	const initialized = useRef(false);

	useEffect(() => {
		if (initialized.current) return;
		initialized.current = true;

		refreshFn()
			.then(({ accessToken }) => {
				setToken(accessToken);
				setStatus("authenticated");
			})
			.catch(() => {
				setToken(null);
				setStatus("unauthenticated");
			});
	}, []);

	async function login(input: LoginRequestInput): Promise<void> {
		const { accessToken } = await loginFn(input);
		setToken(accessToken);
		setStatus("authenticated");
	}

	async function logout(): Promise<void> {
		const token = getToken();
		try {
			if (token) await logoutFn({ accessToken: token });
		} finally {
			setToken(null);
			setStatus("unauthenticated");
		}
	}

	return (
		<AuthCtx.Provider
			value={{
				status,
				isAuthenticated: status === "authenticated",
				login,
				logout,
			}}
		>
			{children}
		</AuthCtx.Provider>
	);
}

export function useAuth(): AuthContext {
	const ctx = useContext(AuthCtx);
	if (!ctx) throw new Error("useAuth must be used within AuthProvider");
	return ctx;
}
