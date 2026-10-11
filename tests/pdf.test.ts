import assert from "node:assert/strict";
import { test } from "node:test";
import { isHeadingLine, splitIntoBlocks } from "../src/lib/pdf/layout";

test("detects headings", () => {
  assert.equal(isHeadingLine("1. DEFINITIONS"), true);
  assert.equal(isHeadingLine("2.1 PAYMENT TERMS"), true);
  assert.equal(isHeadingLine("TERM AND TERMINATION"), true);
  assert.equal(isHeadingLine("This is a normal sentence."), false);
  assert.equal(isHeadingLine("Name: ____"), false);
  assert.equal(isHeadingLine("OK"), false);
});

test("splits text into paragraph blocks of lines", () => {
  assert.deepEqual(splitIntoBlocks("A\nB\n\n\nC"), [["A", "B"], ["C"]]);
  assert.deepEqual(splitIntoBlocks("\n\n  \n"), []);
});

// Real PDF rendering is verified through the running app (/api/export-pdf),
// because react-pdf is built for Next.js's bundler, not the plain Node test runner.
