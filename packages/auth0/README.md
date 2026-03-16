# @r6/auth0

Shared Auth0 (Okta) middleware package for Express services.

## Install in service workspace

```bash
npm install @r6/auth0
```

## Web app auth (login/logout/callback)

```ts
import express from "express";
import { createAuth0WebAuthMiddleware } from "@r6/auth0";

const app = express();

app.use(
  createAuth0WebAuthMiddleware({
    authRequired: false,
    auth0Logout: true,
    secret: process.env.AUTH0_SECRET!,
    baseURL: process.env.AUTH0_BASE_URL!,
    clientID: process.env.AUTH0_CLIENT_ID!,
    issuerBaseURL: process.env.AUTH0_ISSUER_BASE_URL!,
  }),
);
```

## API auth + required scopes

```ts
import express from "express";
import {
  createAuth0ApiJwtMiddleware,
  createRequiredScopesMiddleware,
} from "@r6/auth0-middleware";

const app = express();

const checkJwt = createAuth0ApiJwtMiddleware({
  issuerBaseURL: process.env.AUTH0_ISSUER_BASE_URL!,
  audience: process.env.AUTH0_AUDIENCE!,
});

app.get(
  "/api/private-scoped",
  checkJwt,
  createRequiredScopesMiddleware("read:messages"),
  (_req, res) => {
    res.json({ ok: true });
  },
);
```
