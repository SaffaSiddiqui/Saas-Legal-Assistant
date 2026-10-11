import { AppError, ERRORS } from "@/lib/errors";

/**
 * Reads and parses a JSON request body, refusing anything larger than
 * `maxBytes`. The size is checked while reading, so an oversized or endless
 * upload is stopped early instead of being loaded into memory.
 */
export async function readJsonBody(
  request: Request,
  maxBytes: number,
): Promise<unknown> {
  const declared = Number(request.headers.get("content-length"));
  if (Number.isFinite(declared) && declared > maxBytes) {
    throw new AppError("payload_too_large");
  }

  if (!request.body) {
    throw new AppError("invalid_request");
  }

  const reader = request.body.getReader();
  const chunks: Uint8Array[] = [];
  let total = 0;

  for (;;) {
    const { done, value } = await reader.read();
    if (done) break;
    total += value.byteLength;
    if (total > maxBytes) {
      await reader.cancel();
      throw new AppError("payload_too_large");
    }
    chunks.push(value);
  }

  const text = Buffer.concat(chunks).toString("utf8");
  try {
    return JSON.parse(text);
  } catch {
    throw new AppError("invalid_request");
  }
}

/**
 * Best-effort client address for rate limiting. Forwarding headers can be
 * faked unless the app sits behind a proxy you control, so treat this as a
 * speed bump, not strong protection.
 */
export function getClientIp(request: Request): string {
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) return forwarded.split(",")[0].trim() || "unknown";
  return request.headers.get("x-real-ip")?.trim() || "unknown";
}

/** Converts any thrown error into a safe JSON response. Details stay in the server log. */
export function errorResponse(error: unknown): Response {
  if (error instanceof AppError) {
    const headers: Record<string, string> = { "Cache-Control": "no-store" };
    if (error.retryAfterSeconds) {
      headers["Retry-After"] = String(error.retryAfterSeconds);
    }
    return Response.json(
      {
        ok: false,
        error: {
          code: error.code,
          message: error.message,
          ...(error.fieldErrors ? { fieldErrors: error.fieldErrors } : {}),
        },
      },
      { status: error.status, headers },
    );
  }

  console.error("[api] Unexpected error:", error instanceof Error ? error.name : typeof error);
  return Response.json(
    { ok: false, error: { code: "unknown", message: ERRORS.unknown.message } },
    { status: ERRORS.unknown.status, headers: { "Cache-Control": "no-store" } },
  );
}
