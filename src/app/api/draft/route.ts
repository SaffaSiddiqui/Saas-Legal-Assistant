import { AppError } from "@/lib/errors";
import { BODY_LIMITS, validateDraftRequest } from "@/lib/schemas";
import { generateDraft } from "@/lib/server/gemini";
import { errorResponse, getClientIp, readJsonBody } from "@/lib/server/http";
import { checkRateLimit } from "@/lib/server/rateLimit";

// Allow time for the AI to answer on hosts that enforce a function time limit.
export const maxDuration = 60;

/**
 * POST /api/draft
 * Receives the form values, validates them, asks Gemini for a draft and
 * returns { ok: true, draft: { title, body } }.
 */
export async function POST(request: Request) {
  try {
    const limit = checkRateLimit(`draft:${getClientIp(request)}`, {
      limit: 10,
      windowMs: 5 * 60_000,
    });
    if (!limit.ok) {
      throw new AppError("rate_limited", {
        retryAfterSeconds: limit.retryAfterSeconds,
      });
    }

    const body = await readJsonBody(request, BODY_LIMITS.draft);

    // Never trust the browser: validate again on the server.
    const parsed = validateDraftRequest(body);
    if (!parsed.ok) {
      throw Object.keys(parsed.errors).length > 0
        ? new AppError("validation_failed", { fieldErrors: parsed.errors })
        : new AppError("invalid_request");
    }

    const draft = await generateDraft(parsed.data);
    return Response.json(
      { ok: true, draft },
      { headers: { "Cache-Control": "no-store" } },
    );
  } catch (error) {
    return errorResponse(error);
  }
}
