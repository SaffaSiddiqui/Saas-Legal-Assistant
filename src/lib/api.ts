import { ERRORS } from "@/lib/errors";
import type {
  ApiErrorPayload,
  DraftDocument,
  DraftFormValues,
} from "@/types/document";

/**
 * Browser-side helpers that call our own API routes. The browser never talks
 * to Gemini directly and never sees the API key.
 */

const DRAFT_TIMEOUT_MS = 75_000;
const EXPORT_TIMEOUT_MS = 30_000;

export type DraftResult =
  | { ok: true; draft: DraftDocument }
  | { ok: false; error: ApiErrorPayload };

export type PdfResult =
  | { ok: true; blob: Blob; filename: string }
  | { ok: false; error: ApiErrorPayload };

function failure(code: keyof typeof ERRORS, message?: string): { ok: false; error: ApiErrorPayload } {
  return { ok: false, error: { code, message: message ?? ERRORS[code].message } };
}

/** Explains a failed fetch(): a timeout, or the server could not be reached. */
function networkFailure(error: unknown): { ok: false; error: ApiErrorPayload } {
  if (error instanceof Error && (error.name === "TimeoutError" || error.name === "AbortError")) {
    return failure("ai_timeout");
  }
  return failure("network");
}

async function readErrorPayload(response: Response): Promise<ApiErrorPayload> {
  try {
    const data: unknown = await response.json();
    const error = (data as { error?: Partial<ApiErrorPayload> } | null)?.error;
    if (error && typeof error.message === "string") {
      return {
        code: typeof error.code === "string" ? error.code : "unknown",
        message: error.message,
        fieldErrors: error.fieldErrors,
      };
    }
  } catch {
    // The body was not JSON (for example an HTML error page). Fall through.
  }
  return { code: "unknown", message: ERRORS.unknown.message };
}

function isDraftDocument(value: unknown): value is DraftDocument {
  const draft = value as Partial<DraftDocument> | null;
  return typeof draft?.title === "string" && typeof draft?.body === "string";
}

export async function requestDraft(values: DraftFormValues): Promise<DraftResult> {
  let response: Response;
  try {
    response = await fetch("/api/draft", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(values),
      signal: AbortSignal.timeout(DRAFT_TIMEOUT_MS),
    });
  } catch (error) {
    return networkFailure(error);
  }

  if (!response.ok) {
    return { ok: false, error: await readErrorPayload(response) };
  }

  try {
    const data = (await response.json()) as { draft?: unknown };
    if (isDraftDocument(data.draft)) {
      return { ok: true, draft: data.draft };
    }
  } catch {
    // Fall through to the generic failure below.
  }
  return failure("ai_bad_output");
}

export async function requestPdf(document: DraftDocument): Promise<PdfResult> {
  let response: Response;
  try {
    response = await fetch("/api/export-pdf", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(document),
      signal: AbortSignal.timeout(EXPORT_TIMEOUT_MS),
    });
  } catch (error) {
    if (error instanceof Error && (error.name === "TimeoutError" || error.name === "AbortError")) {
      return failure("pdf_failed");
    }
    return failure("network");
  }

  if (!response.ok) {
    return { ok: false, error: await readErrorPayload(response) };
  }

  try {
    const blob = await response.blob();
    const header = response.headers.get("Content-Disposition") ?? "";
    const filename = /filename="([^"]+)"/.exec(header)?.[1] ?? "legal-document.pdf";
    return { ok: true, blob, filename };
  } catch {
    return failure("pdf_failed");
  }
}

/** Saves a file in the browser using a temporary link. */
export function downloadBlob(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  // Give the browser a moment to start the download before freeing the file.
  setTimeout(() => URL.revokeObjectURL(url), 10_000);
}
