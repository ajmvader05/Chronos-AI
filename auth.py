import logging
import os
from functools import lru_cache
from typing import Optional

import jwt
from fastapi import Header, HTTPException
from jwt import InvalidTokenError, PyJWKClient, PyJWKClientError

logger = logging.getLogger("chronos.auth")


def _get_jwks_url() -> str:
    jwks_url = os.getenv("SUPABASE_JWKS_URL")
    if jwks_url:
        return jwks_url
    project_ref = os.getenv("SUPABASE_PROJECT_REF")
    if project_ref:
        return f"https://{project_ref}.supabase.co/auth/v1/keys"
    raise RuntimeError("SUPABASE_PROJECT_REF or SUPABASE_JWKS_URL must be set")


def _get_audience() -> str:
    return os.getenv("SUPABASE_JWT_AUDIENCE", "authenticated")


@lru_cache(maxsize=1)
def _get_jwk_client(jwks_url: str) -> PyJWKClient:
    return PyJWKClient(jwks_url)


def get_current_user_id(
    authorization: Optional[str] = Header(None),
) -> str:
    if not authorization or not authorization.startswith("Bearer "):
        logger.warning("Auth failed: missing token.")
        raise HTTPException(
            status_code=401,
            detail={"error": "Invalid or missing token"},
        )

    token = authorization.split(" ", 1)[1]
    try:
        jwks_url = _get_jwks_url()
    except RuntimeError as exc:
        logger.error("Auth configuration error: %s", exc)
        raise HTTPException(
            status_code=500,
            detail={"error": "Auth configuration error"},
        ) from exc

    try:
        signing_key = _get_jwk_client(jwks_url).get_signing_key_from_jwt(token)
        payload = jwt.decode(
            token,
            signing_key.key,
            algorithms=["RS256"],
            audience=_get_audience(),
            options={"require": ["exp", "aud", "sub"]},
        )
    except (InvalidTokenError, PyJWKClientError) as exc:
        logger.warning("Auth failed: invalid token.")
        raise HTTPException(
            status_code=401,
            detail={"error": "Invalid or missing token"},
        ) from exc

    user_id = payload.get("sub")
    if not user_id:
        logger.warning("Auth failed: missing sub claim.")
        raise HTTPException(
            status_code=401,
            detail={"error": "Invalid or missing token"},
        )

    logger.info("Auth success for user_id=%s", user_id)
    return user_id
