# Chronos

## Local environment setup

The frontend reads its API base URL from Vite environment variables. Create a
`.env` file inside `chronos-ui/` (you can copy `.env.example`) and set:

```bash
VITE_API_URL=https://chronos-ai.onrender.com
```

The backend now validates Supabase-issued JWTs. Configure one of the following
environment variables:

- `SUPABASE_PROJECT_REF` → your Supabase project ref (used to derive the JWKS URL)
- `SUPABASE_JWKS_URL` → direct JWKS endpoint URL

## Render environment variables

When deploying on Render, configure environment variables for both services:

- **Frontend service (Vite):**
  - `VITE_API_URL` → base URL of the backend service (e.g. `https://chronos-ai.onrender.com`)
- **Backend service:**
  - `SUPABASE_PROJECT_REF` or `SUPABASE_JWKS_URL` → required for JWT validation

## Frontend env vars

```bash
VITE_API_URL=https://chronos-ai.onrender.com
```
