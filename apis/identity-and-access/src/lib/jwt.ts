import {
	calculateJwkThumbprint,
	exportJWK,
	importPKCS8,
	importSPKI,
	type JWTPayload,
	jwtVerify,
	SignJWT,
} from "jose";
import { env } from "../config.js";

let privateKey: CryptoKey | null = null;
let publicKey: CryptoKey | null = null;

const loadKeys = async (): Promise<void> => {
	if (privateKey && publicKey) return;
	[privateKey, publicKey] = await Promise.all([
		importPKCS8(env.JWT_PRIVATE_KEY, "RS256"),
		importSPKI(env.JWT_PUBLIC_KEY, "RS256"),
	]);
};

export type AccessTokenPayload = {
	sub: string;
	kind: string;
};

export const signAccessToken = async (
	payload: AccessTokenPayload,
): Promise<string> => {
	await loadKeys();

	const expiresAt = new Date(Date.now() + Number(env.JWT_ACCESS_TTL_MS));

	return new SignJWT({ kind: payload.kind })
		.setProtectedHeader({ alg: "RS256" })
		.setSubject(payload.sub)
		.setIssuer(env.JWT_ISSUER)
		.setAudience(env.JWT_AUDIENCE)
		.setIssuedAt()
		.setExpirationTime(expiresAt)
		.sign(privateKey as CryptoKey);
};

export const verifyAccessToken = async (token: string): Promise<JWTPayload> => {
	await loadKeys();

	const { payload } = await jwtVerify(token, publicKey as CryptoKey, {
		issuer: env.JWT_ISSUER,
		audience: env.JWT_AUDIENCE,
		algorithms: ["RS256"],
	});

	return payload;
};

export const getPublicJwk = async () => {
	await loadKeys();

	const jwk = await exportJWK(publicKey as CryptoKey);
	const kid = await calculateJwkThumbprint(jwk);

	return { ...jwk, use: "sig", alg: "RS256", kid };
};
