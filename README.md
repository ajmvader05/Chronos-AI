# Chronos

## Local environment setup

The frontend reads its API base URL and auth token from Vite environment variables.
Create a `.env` file inside `chronos-ui/` (you can copy `.env.example`) and set:

```bash
VITE_API_URL=https://chronos-ai.onrender.com
VITE_API_TOKEN=your-local-token
```

The backend expects the same token in `CHRONOS_API_TOKEN` when you start the API
server. Ensure you export it in your shell or load it in your hosting environment.

## Render environment variables

When deploying on Render, configure environment variables for both services:

- **Frontend service (Vite):**
  - `VITE_API_URL` → base URL of the backend service (e.g. `https://chronos-ai.onrender.com`)
  - `VITE_API_TOKEN` → the shared auth token
- **Backend service:**
  - `CHRONOS_API_TOKEN` → the same shared auth token used by the frontend

## Frontend env vars

```bash
VITE_API_URL=https://chronos-ai.onrender.com
VITE_API_TOKEN=chronos-dev-token
```
