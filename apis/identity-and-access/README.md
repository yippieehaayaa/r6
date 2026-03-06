```
npm install
npm run dev
```

```
open http://localhost:3000
```

Environment notes (from .env.sample):

RS256 Key Pair

Generate with:

	openssl genrsa -out private.pem 2048
	openssl rsa -in private.pem -pubout -out public.pem

For .env files: collapse each PEM to a single line by replacing real newlines
with \n (the dotenv parser expands them back when the value is double-quoted):

	awk 'NF {ORS="\\n"; print}' private.pem

On AWS: store the full multi-line PEM in Secrets Manager and inject as an
environment variable — ECS / Lambda preserve newlines automatically.

Token configuration

Issuer must match the value verified by all downstream microservices.

JWT_ISSUER should be set to your issuer URL (example: https://auth.example.com)

Audience identifies the intended consumer(s) of the token.

JWT_AUDIENCE should identify the API (example: api.example.com)

Access token TTL in milliseconds (default 900000 = 15 minutes).

JWT_ACCESS_TTL_MS=900000

Session / Refresh Token

Secret used to HMAC-hash refresh tokens before storing them in the DB.
Must also be set in dbs/identity-and-access/.env.

Generate a secret with:

	node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"

HASH_SECRET should be a 64-character hex string.
