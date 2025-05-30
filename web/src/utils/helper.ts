import { ErrorCode } from "@/constants/error";

// Helper to extract error from FastAPI response
export async function extractError(res: Response, fallbackMsg: string) {
  try {
    const data = await res.json();
    if (
      data.detail &&
      typeof data.detail === "object" &&
      data.detail.error_code &&
      data.detail.msg
    ) {
      return {
        error: {
          msg: data.detail.msg,
          error_code: data.detail.error_code as ErrorCode,
        },
      };
    }
    if (data.detail) {
      return {
        error: {
          msg:
            typeof data.detail === "string"
              ? data.detail
              : JSON.stringify(data.detail),
          error_code: ErrorCode.INVALID_INPUT,
        },
      };
    }
    return { error: { msg: fallbackMsg, error_code: ErrorCode.INVALID_INPUT } };
  } catch {
    return { error: { msg: fallbackMsg, error_code: ErrorCode.INVALID_INPUT } };
  }
}
