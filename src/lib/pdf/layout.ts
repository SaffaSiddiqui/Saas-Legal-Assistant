/** Pure text-layout helpers for the PDF (no PDF library needed, so they are easy to test). */

/** A line like "1. DEFINITIONS" or "TERM AND TERMINATION" is shown as a bold heading. */
export function isHeadingLine(line: string): boolean {
  const trimmed = line.trim();
  if (trimmed.length < 3 || trimmed.length > 80) return false;
  return /^(\d+(\.\d+)*\.?\s+)?[A-Z][A-Z0-9 ,&'’\-/()]+$/.test(trimmed);
}

/** Splits text into paragraphs (blank-line separated), each a list of lines. */
export function splitIntoBlocks(body: string): string[][] {
  return body
    .replace(/\r\n?/g, "\n")
    .trim()
    .split(/\n{2,}/)
    .map((block) => block.split("\n").map((line) => line.replace(/\s+$/, "")))
    .filter((lines) => lines.some((line) => line.trim() !== ""));
}
