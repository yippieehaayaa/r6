import type { IdentitySafe, LoginRequestInput } from "@r6/schemas";
import {
	createContext,
	useCallback,
	useContext,
	useEffect,
	useRef,
	useState,
} from "react";
import { loginFn } from "@/api/identity-and-access/auth/mutations/login";
import { logoutFn } from "@/api/identity-and-access/auth/mutations/logout";
import { refreshFn } from "@/api/identity-and-access/auth/mutations/refresh";
import { verifyTotpFn } from "@/api/identity-and-access/auth/mutations/verify-totp";
import { getToken, setToken } from "@/api/token";
import { parseTokenClaims, type TokenClaims } from "@/lib/parse-token";

type AuthStatus = "loading" | "authenticated" | "unauthenticated";

export type UserProfile = Pick<
	IdentitySafe,
	"username" | "email" | "totpEnabled"
>;

export type LoginResult =
	| { totpRequired: false }
	| { totpRequired: true; challengeToken: string };

export interface AuthContext {
	status: AuthStatus;
	isAuthenticated: boolean;
	claims: TokenClaims | null;
	profile: UserProfile | null;
	hasPermission: (permission: string) => boolean;
	hasRole: (role: string) => boolean;
	login: (input: LoginRequestInput) => Promise<LoginResult>;
	totpVerify: (challengeToken: string, code: string) => Promise<void>;
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

	async function login(input: LoginRequestInput): Promise<LoginResult> {
		const result = await loginFn(input);
		if ("totpRequired" in result && result.totpRequired) {
			return { totpRequired: true, challengeToken: result.challengeToken };
		}
		if ("accessToken" in result) {
			await hydrateSession(result.accessToken);
		}
		return { totpRequired: false };
	}

	async function totpVerify(
		challengeToken: string,
		code: string,
	): Promise<void> {
		const { accessToken } = await verifyTotpFn({ challengeToken, code });
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
				totpVerify,
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
