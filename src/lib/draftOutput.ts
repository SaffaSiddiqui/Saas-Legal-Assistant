import { z } from "zod";
import { EXPORT_LIMITS } from "@/lib/schemas";
import type { DraftDocument } from "@/types/document";

/** JSON schema sent to Gemini so it returns { title, body }. */
export const DRAFT_JSON_SCHEMA = {
  type: "object",
  properties: {
    title: {
      type: "string",
      description: "A short document title, for example 'Non-Disclosure Agreement'.",
    },
    body: {
      type: "string",
      description:
        "The full document as plain text with blank lines between paragraphs. No Markdown.",
    },
  },
  required: ["title", "body"],
} as const;

const modelOutputSchema = z.object({
  title: z.string().trim().min(1),
  body: z.string().trim().min(80).max(EXPORT_LIMITS.body),
});

/**
 * Cleans up text so it prints correctly in the editor and PDF:
 * unifies line endings, swaps rare look-alike characters for plain ones,
 * and removes Markdown the model sometimes adds despite instructions.
 */
export function normalizeDraftText(text: string): string {
  return text
    .replace(/\r\n?/g, "\n")
    .replace(/[\u2010-\u2012\u2212]/g, "-")
    .replace(/[\u2002-\u200a\u202f\u205f]/g, " ")
    .replace(/[\u200b-\u200d\u2060\ufeff]/g, "")
    .replace(/\*\*|__/g, "")
    .replace(/^#{1,6}\s+/gm, "")
    .replace(/[ \t]+\n/g, "\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

/**
 * Turns the model's raw text into a draft, or returns null if it is not a
 * usable { title, body } object. Never trust model output without checking it.
 */
export function parseDraftOutput(rawText: string): DraftDocument | null {
  let text = rawText.trim();

  // Some models wrap JSON in a code fence even when told not to.
  const fenced = text.match(/^```(?:json)?\s*([\s\S]*?)\s*```$/i);
  if (fenced) text = fenced[1];

  let json: unknown;
  try {
    json = JSON.parse(text);
  } catch {
    return null;
  }

  if (typeof json !== "object" || json === null) return null;
  const candidate = json as { title?: unknown; body?: unknown };
  if (typeof candidate.title !== "string" || typeof candidate.body !== "string") {
    return null;
  }

  const parsed = modelOutputSchema.safeParse({
    title: normalizeDraftText(candidate.title).slice(0, EXPORT_LIMITS.title),
    body: normalizeDraftText(candidate.body),
  });
  return parsed.success ? parsed.data : null;
}
