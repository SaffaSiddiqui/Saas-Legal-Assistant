import { ApiError } from "@google/genai";
import { AppError } from "@/lib/errors";

function isAbort(error: unknown): boolean {
  if (!(error instanceof Error)) return false;
  if (error.name === "AbortError" || error.name === "TimeoutError") return true;
  const cause = (error as { cause?: unknown }).cause;
  return cause instanceof Error && (cause.name === "AbortError" || cause.name === "TimeoutError");
}

/** Translates anything the Gemini SDK can throw into an error we can explain to the user. */
export function mapGeminiError(error: unknown): AppError {
  if (error instanceof AppError) return error;
  if (isAbort(error)) return new AppError("ai_timeout");

  if (error instanceof ApiError) {
    const { status } = error;
    if (status === 401 || status === 403) return new AppError("ai_key_rejected");
    if (status === 400 && /api key/i.test(error.message)) {
      return new AppError("ai_key_rejected");
    }
    if (status === 404) return new AppError("ai_model_unavailable");
    if (status === 429) return new AppError("ai_quota");
    if (status === 408 || status === 504) return new AppError("ai_timeout");
    if (status >= 500) return new AppError("ai_busy");
    return new AppError("ai_unavailable");
  }

  // Anything else (for example a network failure) means we could not reach the service.
  return new AppError("ai_unavailable");
}

/** Safe summary for server logs: never includes the user's document text. */
export function describeErrorForLog(error: unknown): string {
  if (error instanceof ApiError) return `ApiError status=${error.status}`;
  if (error instanceof Error) return describeErrorCause(error);
  return typeof error;
}

function describeErrorCause(error: Error, depth = 0): string {
  const code =
    "code" in error && typeof error.code === "string" ? ` code=${error.code}` : "";
  const summary = `${error.name}${code}`;
  if (depth >= 2 || !(error.cause instanceof Error)) return summary;
  return `${summary} cause=(${describeErrorCause(error.cause, depth + 1)})`;
}
