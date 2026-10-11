import { z } from "zod";
import { DOCUMENT_TYPE_IDS } from "@/lib/documentTypes";
import type {
  DraftDocument,
  DraftFormValues,
  FieldErrors,
} from "@/types/document";

/**
 * Size limits. They keep requests (and AI costs) reasonable and are enforced
 * both in the browser and on the server.
 */
export const LIMITS = {
  partyName: 120,
  jurisdiction: 120,
  purpose: 1000,
  extraDetails: 3000,
} as const;

/** Limits for the document that is exported to PDF. */
export const EXPORT_LIMITS = {
  title: 200,
  body: 60_000,
} as const;

/** Maximum request body sizes in bytes (checked before parsing). */
export const BODY_LIMITS = {
  draft: 32 * 1024,
  exportPdf: 300 * 1024,
} as const;

/** Order used to focus the first invalid field. */
export const FIELD_ORDER: (keyof DraftFormValues)[] = [
  "documentType",
  "partyA",
  "partyB",
  "jurisdiction",
  "purpose",
  "extraDetails",
];

const tooLong = (max: number) => `Please keep this under ${max} characters.`;

export const draftRequestSchema = z.object({
  documentType: z.enum(DOCUMENT_TYPE_IDS, {
    error: "Choose one of the document types.",
  }),
  partyA: z
    .string()
    .trim()
    .min(1, "Enter a name for this party.")
    .max(LIMITS.partyName, tooLong(LIMITS.partyName)),
  partyB: z
    .string()
    .trim()
    .min(1, "Enter a name for this party.")
    .max(LIMITS.partyName, tooLong(LIMITS.partyName)),
  jurisdiction: z
    .string()
    .trim()
    .min(1, "Enter the governing jurisdiction, such as a country or state.")
    .max(LIMITS.jurisdiction, tooLong(LIMITS.jurisdiction)),
  purpose: z
    .string()
    .trim()
    .min(10, "Describe the purpose in a sentence (at least 10 characters).")
    .max(LIMITS.purpose, tooLong(LIMITS.purpose)),
  // Optional: an empty string is fine.
  extraDetails: z
    .string()
    .trim()
    .max(LIMITS.extraDetails, tooLong(LIMITS.extraDetails)),
});

export type ValidationResult =
  | { ok: true; data: DraftFormValues }
  | { ok: false; errors: FieldErrors };

/**
 * Validates unknown input (form values in the browser, request body on the server).
 * Returns trimmed data on success, or one message per invalid field.
 */
export function validateDraftRequest(input: unknown): ValidationResult {
  const result = draftRequestSchema.safeParse(input);
  if (result.success) {
    return { ok: true, data: result.data };
  }

  const errors: FieldErrors = {};
  for (const issue of result.error.issues) {
    const key = issue.path[0];
    if (typeof key === "string" && !(key in errors)) {
      errors[key as keyof DraftFormValues] = issue.message;
    }
  }
  return { ok: false, errors };
}

export const exportRequestSchema = z.object({
  title: z
    .string()
    .trim()
    .min(1, "Add a title before exporting.")
    .max(EXPORT_LIMITS.title, `Keep the title under ${EXPORT_LIMITS.title} characters.`),
  body: z
    .string()
    .trim()
    .min(1, "The document is empty. Add some text before exporting.")
    .max(
      EXPORT_LIMITS.body,
      `The document is too long to export (the limit is ${EXPORT_LIMITS.body.toLocaleString("en-US")} characters).`,
    ),
});

export type ExportValidationResult =
  | { ok: true; data: DraftDocument }
  | { ok: false; message: string };

/** Validates the title and text that will become a PDF. */
export function validateExportRequest(input: unknown): ExportValidationResult {
  const result = exportRequestSchema.safeParse(input);
  if (result.success) {
    return { ok: true, data: result.data };
  }
  return {
    ok: false,
    message: result.error.issues[0]?.message ?? "This document can't be exported.",
  };
}
