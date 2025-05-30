import { ErrorCode } from "@/constants/error";

/**
 * The goal here is to centralize the error messaging logic
 */
export class ApiError extends Error {
  errorCode: ErrorCode;

  constructor(message: string, errorCode: ErrorCode) {
    super(message);
    this.name = "ApiError";
    this.errorCode = errorCode;
  }
}

// Helper to parse error from API response and throw ApiError
export async function throwIfErrorResponse(res: Response, fallbackMsg: string) {
  if (res.ok) return;

  const data = await res.json();

  if (data?.error?.msg && data?.error?.error_code) {
    throw new ApiError(data.error.msg, data.error.error_code as ErrorCode);
  }
  throw new ApiError(
    typeof data?.error === "string" ? data.error : fallbackMsg,
    ErrorCode.INVALID_INPUT,
  );
}

// Returns a user-friendly error message for a given ApiError
export function getErrorText(error: unknown): string {
  if (error instanceof ApiError) {
    switch (error.errorCode) {
      case ErrorCode.HIGH_PRIORITY_LIMIT:
        return "You cannot create more than 5 high priority tasks.";
      case ErrorCode.TASK_NOT_FOUND:
        return "The requested task was not found.";
      case ErrorCode.INVALID_INPUT:
        return error.message || "Invalid input.";
      case ErrorCode.INTERNAL_SERVER_ERROR:
        return "A server error occurred. Please try again later.";
      case ErrorCode.UNKNOWN_ERROR:
        return "An unknown error occurred.";
      default:
        return error.message || "An error occurred.";
    }
  }
  // Fallback for non-ApiError
  return error instanceof Error
    ? error.message
    : "An unexpected error occurred.";
}
