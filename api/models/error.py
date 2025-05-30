"""Error handling for the API."""

from enum import Enum

from fastapi import HTTPException


class ErrorCode(str, Enum):
    """Error codes for the API."""

    TASK_NOT_FOUND = "TASK_NOT_FOUND"
    HIGH_PRIORITY_LIMIT = "HIGH_PRIORITY_LIMIT"
    INVALID_INPUT = "INVALID_INPUT"
    # Add more as needed


def error_response(status_code: int, code: ErrorCode, message: str) -> HTTPException:
    """Helper to create a structured HTTPException with error code and message."""
    return HTTPException(
        status_code=status_code, detail={"msg": message, "error_code": code}
    )
