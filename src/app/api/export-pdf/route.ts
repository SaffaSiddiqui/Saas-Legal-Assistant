import { AppError } from "@/lib/errors";
import { renderPdf } from "@/lib/pdf/renderPdf";
import {
  buildPdfFilename,
  findUnsupportedPdfChars,
  unsupportedCharsMessage,
} from "@/lib/pdfText";
import { BODY_LIMITS, validateExportRequest } from "@/lib/schemas";
import { errorResponse, getClientIp, readJsonBody } from "@/lib/server/http";
import { checkRateLimit } from "@/lib/server/rateLimit";

/**
 * POST /api/export-pdf
 * Receives the current (possibly edited) title and text and returns a PDF file.
 * This route never calls the AI, so exporting is free and fast.
 */
export async function POST(request: Request) {
  try {
    const limit = checkRateLimit(`pdf:${getClientIp(request)}`, {
      limit: 30,
      windowMs: 5 * 60_000,
    });
    if (!limit.ok) {
      throw new AppError("rate_limited", {
        retryAfterSeconds: limit.retryAfterSeconds,
      });
    }

    const body = await readJsonBody(request, BODY_LIMITS.exportPdf);

    const parsed = validateExportRequest(body);
    if (!parsed.ok) {
      throw new AppError("validation_failed", { message: parsed.message });
    }
    const { title, body: text } = parsed.data;

    const unsupported = findUnsupportedPdfChars(`${title}\n${text}`);
    if (unsupported.length > 0) {
      throw new AppError("pdf_unsupported_chars", {
        message: unsupportedCharsMessage(unsupported),
      });
    }

    let pdf: Buffer;
    try {
      pdf = await renderPdf({ title, body: text });
    } catch (error) {
      console.error(
        "[export-pdf] Rendering failed:",
        error instanceof Error ? error.name : typeof error,
      );
      throw new AppError("pdf_failed");
    }

    const filename = buildPdfFilename(title);
    return new Response(new Uint8Array(pdf), {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="${filename}"`,
        "Content-Length": String(pdf.byteLength),
        "Cache-Control": "no-store",
      },
    });
  } catch (error) {
    return errorResponse(error);
  }
}
