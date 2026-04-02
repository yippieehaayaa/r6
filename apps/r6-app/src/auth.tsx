import type { IdentitySafe, LoginRequestInput } from "@r6/schemas";
import {
	createContext,
	useCallback,
	useContext,
	useEffect,
	useRef,
	useState,
} from "react";
import { loginFn } from "@/api/auth/mutations/login";
import { logoutFn } from "@/api/auth/mutations/logout";
import { refreshFn } from "@/api/auth/mutations/refresh";
import { getMeFn } from "@/api/me/queries/get-me";
import { getToken, setToken } from "@/api/token";
import { parseTokenClaims, type TokenClaims } from "@/lib/parse-token";

type AuthStatus = "loading" | "authenticated" | "unauthenticated";

export type UserProfile = Pick<IdentitySafe, "username" | "email">;

export interface AuthContext {
	status: AuthStatus;
	isAuthenticated: boolean;
	claims: TokenClaims | null;
	profile: UserProfile | null;
	hasPermission: (permission: string) => boolean;
	hasRole: (role: string) => boolean;
	login: (input: LoginRequestInput) => Promise<void>;
	logout: () => Promise<void>;
}

const AuthCtx = createContext<AuthContext | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
	const [status, setStatus] = useState<AuthStatus>("loading");
	const [claims, setClaims] = useState<TokenClaims | null>(null);
	const [profile, setProfile] = useState<UserProfile | null>(null);
	const initialized = useRef(false);

	const hydrateSession = useCallback(
		async (accessToken: string): Promise<void> => {
			setToken(accessToken);
			setClaims(parseTokenClaims(accessToken));
			// Profile fetch is best-effort — auth still succeeds if /me fails.
			getMeFn()
				.then((me) => setProfile({ username: me.username, email: me.email }))
				.catch(() => null);
			setStatus("authenticated");
		},
		[],
	);

	useEffect(() => {
		if (initialized.current) return;
		initialized.current = true;

		refreshFn()
			.then(({ accessToken }) => hydrateSession(accessToken))
			.catch(() => {
				setToken(null);
				setStatus("unauthenticated");
			});
	}, [hydrateSession]);

	async function login(input: LoginRequestInput): Promise<void> {
		const { accessToken } = await loginFn(input);
		await hydrateSession(accessToken);
	}

	async function logout(): Promise<void> {
		const token = getToken();
		try {
			if (token) await logoutFn({ accessToken: token });
		} finally {
			setToken(null);
			setClaims(null);
			setProfile(null);
			setStatus("unauthenticated");
		}
	}

	function hasPermission(permission: string): boolean {
		if (!claims) return false;
		if (claims.kind === "ADMIN") return true;
		const required = permission.split(":");
		return claims.permissions.some((granted) => {
			const segments = granted.split(":");
			if (segments.length !== required.length) return false;
			return segments.every((seg, i) => seg === "*" || seg === required[i]);
		});
	}

	function hasRole(role: string): boolean {
		return claims?.roles.includes(role) ?? false;
	}

	return (
		<AuthCtx.Provider
			value={{
				status,
				isAuthenticated: status === "authenticated",
				claims,
				profile,
				hasPermission,
				hasRole,
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
