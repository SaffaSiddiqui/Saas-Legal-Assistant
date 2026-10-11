import assert from "node:assert/strict";
import { test } from "node:test";
import {
  buildPdfFilename,
  describePdfChar,
  findUnsupportedPdfChars,
} from "../src/lib/pdfText";

test("allows normal punctuation, accents and typographic quotes", () => {
  assert.deepEqual(findUnsupportedPdfChars("Café “quoted” — it’s €5 …\n\t"), []);
});

test("finds characters the PDF fonts cannot print", () => {
  const found = findUnsupportedPdfChars("Arrow → and Urdu اردو and emoji 😀");
  assert.ok(found.includes("→"));
  assert.ok(found.includes("ا"));
  assert.ok(found.includes("😀"));
});

test("describes invisible characters by code", () => {
  assert.equal(describePdfChar("\u200b"), "U+200B");
  assert.equal(describePdfChar("→"), "→");
});

test("builds safe filenames", () => {
  const date = new Date("2026-10-10T12:00:00Z");
  assert.equal(buildPdfFilename("Non-Disclosure Agreement", date), "non-disclosure-agreement-2026-10-10.pdf");
  assert.equal(buildPdfFilename("../../etc/passwd", date), "etc-passwd-2026-10-10.pdf");
  assert.equal(buildPdfFilename("!!!", date), "legal-document-2026-10-10.pdf");
  assert.equal(buildPdfFilename("Café Müller", date), "cafe-muller-2026-10-10.pdf");
  assert.ok(buildPdfFilename("a".repeat(300), date).length < 80);
});
