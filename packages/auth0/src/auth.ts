import type { RequestHandler } from "express";
import { auth as apiAuth, requiredScopes } from "express-oauth2-jwt-bearer";
import { auth as oidcAuth } from "express-openid-connect";

export type Auth0WebAuthOptions = {
  authRequired?: boolean;
  auth0Logout?: boolean;
  secret: string;
  baseURL: string;
  clientID: string;
  issuerBaseURL: string;
  clientSecret?: string;
  idpLogout?: boolean;
  authorizationParams?: Record<string, string | number | boolean>;
};

export type Auth0ApiAuthOptions = {
  issuerBaseURL: string;
  audience: string | string[];
  tokenSigningAlg?: string;
};

export const createAuth0WebAuthMiddleware = (
  options: Auth0WebAuthOptions,
): RequestHandler => {
  return oidcAuth(options);
};

export const createAuth0ApiJwtMiddleware = (
  options: Auth0ApiAuthOptions,
): RequestHandler => {
  return apiAuth(options);
};

export const createRequiredScopesMiddleware = (
  scopes: string | string[],
): RequestHandler => {
  return requiredScopes(scopes);
};

export const createProtectedRouteMiddleware = (
  options: Auth0ApiAuthOptions,
  ...scopes: [string, ...string[]]
): RequestHandler[] => {
  const checkJwt = createAuth0ApiJwtMiddleware(options);
  const checkScopes = createRequiredScopesMiddleware(scopes);

  return [checkJwt, checkScopes];
};
