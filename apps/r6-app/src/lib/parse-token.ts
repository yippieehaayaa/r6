export interface TokenClaims {
	sub: string;
	kind: string;
	tenantSlug: string | null;
	roles: string[];
	permissions: string[];
}

/**
 * Decodes the payload segment of a JWT without verifying the signature.
 * Verification is always performed server-side; this is only used to
 * make claims available to the UI (route guards, sidebar, etc.).
 */
export function parseTokenClaims(token: string): TokenClaims {
	const segment = token.split(".")[1];
	if (!segment) throw new Error("Malformed JWT: missing payload segment");

	const json = atob(segment.replace(/-/g, "+").replace(/_/g, "/"));
	const payload = JSON.parse(json) as Record<string, unknown>;

	return {
		sub: typeof payload.sub === "string" ? payload.sub : "",
		kind: typeof payload.kind === "string" ? payload.kind : "",
		tenantSlug:
			typeof payload.tenantSlug === "string" ? payload.tenantSlug : null,
		roles: Array.isArray(payload.roles)
			? (payload.roles as string[])
			: [],
		permissions: Array.isArray(payload.permissions)
			? (payload.permissions as string[])
			: [],
	};
}
