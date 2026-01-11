import logging
import os
from typing import Optional

from fastapi import Header, HTTPException

logger = logging.getLogger("chronos.auth")


def get_current_user_id(
    authorization: Optional[str] = Header(None),
) -> str:
    expected_token = os.getenv("CHRONOS_API_TOKEN")
    if not expected_token:
        logger.error("Auth configuration missing CHRONOS_API_TOKEN.")

    if not authorization:
        logger.warning("Auth failed: missing Authorization header.")
        raise HTTPException(
            status_code=401,
            detail={"error": "Invalid token"},
        )

    scheme, _, token = authorization.partition(" ")
    if scheme.lower() != "bearer" or not token:
        logger.warning("Auth failed: malformed Authorization header.")
        raise HTTPException(
            status_code=401,
            detail={"error": "Invalid token"},
        )

    if not expected_token:
        logger.warning("Auth failed: missing configured token.")
        raise HTTPException(
            status_code=401,
            detail={"error": "Invalid token"},
        )

    if token != expected_token:
        logger.warning("Auth failed: token mismatch.")
        raise HTTPException(
            status_code=401,
            detail={"error": "Invalid token"},
        )

    logger.info("Auth success for API token request.")
    return "api-token"
