/**
 * Helpers for PDF export that run in both the browser and on the server.
 *
 * The PDF uses the standard built-in PDF fonts, which cover Western European
 * (Windows-1252) text. Anything outside that range would be missing or garbled
 * in a legal document, so we detect it and tell the user instead.
 */

const EXTRA_SUPPORTED = new Set([..."€‚ƒ„…†‡ˆ‰Š‹ŒŽ‘’“”•–—˜™š›œžŸ"]);

export function isPdfSupportedChar(char: string): boolean {
  const code = char.codePointAt(0);
  if (code === undefined) return true;
  if (char === "\n" || char === "\r" || char === "\t") return true;
  if (code >= 0x20 && code <= 0x7e) return true;
  if (code >= 0xa0 && code <= 0xff) return true;
  return EXTRA_SUPPORTED.has(char);
}

/** Returns the distinct characters the PDF cannot print (at most `max`). */
export function findUnsupportedPdfChars(text: string, max = 8): string[] {
  const found = new Set<string>();
  for (const char of text) {
    if (!isPdfSupportedChar(char)) {
      found.add(char);
      if (found.size >= max) break;
    }
  }
  return [...found];
}

/** Shows a character for an error message; invisible ones appear as U+XXXX. */
export function describePdfChar(char: string): string {
  if (/[\p{C}\p{Z}]/u.test(char)) {
    const code = char.codePointAt(0) ?? 0;
    return `U+${code.toString(16).toUpperCase().padStart(4, "0")}`;
  }
  return char;
}

export function unsupportedCharsMessage(chars: string[]): string {
  return `The PDF can't print these characters yet: ${chars
    .map(describePdfChar)
    .join(" ")}. Replace or remove them and try again.`;
}

/** Turns a title into a safe, readable filename such as "service-agreement-2026-10-10.pdf". */
export function buildPdfFilename(title: string, now: Date = new Date()): string {
  const slug = title
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60)
    .replace(/-+$/g, "");
  const date = now.toISOString().slice(0, 10);
  return `${slug || "legal-document"}-${date}.pdf`;
}
