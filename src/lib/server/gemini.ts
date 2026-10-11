import "server-only";
import { FinishReason, GoogleGenAI, ThinkingLevel } from "@google/genai";
import { AppError } from "@/lib/errors";
import { DRAFT_JSON_SCHEMA, parseDraftOutput } from "@/lib/draftOutput";
import type { DraftDocument, DraftFormValues } from "@/types/document";
import { describeErrorForLog, mapGeminiError } from "./geminiErrors";
import { buildSystemInstruction, buildUserPrompt } from "./prompts";

/**
 * This is the only file that talks to Gemini, and `server-only` makes the
 * build fail if any browser code ever imports it. The API key is read from the
 * server environment here and never leaves the server.
 */

const DEFAULT_MODEL = "gemini-2.5-flash";
const REQUEST_TIMEOUT_MS = 55_000;
const MAX_OUTPUT_TOKENS = 8192;

/** Finish reasons that mean the model refused or was filtered. */
const BLOCKED_REASONS = new Set<string>([
  FinishReason.SAFETY,
  FinishReason.PROHIBITED_CONTENT,
  FinishReason.BLOCKLIST,
  FinishReason.RECITATION,
]);

function getModelName(): string {
  const configured = process.env.GEMINI_MODEL?.trim() || DEFAULT_MODEL;
  // The model name becomes part of a URL, so only allow normal characters.
  if (!/^[A-Za-z0-9._-]+$/.test(configured)) {
    console.error("[draft] GEMINI_MODEL contains unexpected characters");
    throw new AppError("ai_model_unavailable");
  }
  return configured;
}

/** Asks Gemini for a first draft and returns a validated { title, body }. */
export async function generateDraft(
  request: DraftFormValues,
): Promise<DraftDocument> {
  const apiKey = process.env.GEMINI_API_KEY?.trim();
  if (!apiKey) {
    console.error("[draft] GEMINI_API_KEY is not set");
    throw new AppError("ai_not_configured");
  }

  const model = getModelName();
  const ai = new GoogleGenAI({ apiKey });

  let response;
  try {
    response = await ai.models.generateContent({
      model,
      contents: buildUserPrompt(request),
      config: {
        systemInstruction: buildSystemInstruction(request.documentType),
        thinkingConfig: { thinkingLevel: ThinkingLevel.LOW },
        maxOutputTokens: MAX_OUTPUT_TOKENS,
        responseMimeType: "application/json",
        responseJsonSchema: DRAFT_JSON_SCHEMA,
        abortSignal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
      },
    });
  } catch (error) {
    console.error("[draft] Gemini request failed:", describeErrorForLog(error));
    throw mapGeminiError(error);
  }

  if (response.promptFeedback?.blockReason) {
    console.error("[draft] Prompt blocked:", response.promptFeedback.blockReason);
    throw new AppError("ai_blocked");
  }

  const candidate = response.candidates?.[0];
  if (!candidate) {
    console.error("[draft] Gemini returned no candidates");
    throw new AppError("ai_bad_output");
  }

  const finishReason = candidate.finishReason;
  if (finishReason && BLOCKED_REASONS.has(finishReason)) {
    console.error("[draft] Response blocked:", finishReason);
    throw new AppError("ai_blocked");
  }
  if (finishReason === FinishReason.MAX_TOKENS) {
    console.error("[draft] Response was cut off (MAX_TOKENS)");
    throw new AppError("ai_bad_output");
  }

  const draft = parseDraftOutput(response.text ?? "");
  if (!draft) {
    console.error("[draft] Response was not a valid { title, body } object");
    throw new AppError("ai_bad_output");
  }

  return draft;
}
