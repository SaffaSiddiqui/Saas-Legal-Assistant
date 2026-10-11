import assert from "node:assert/strict";
import { test } from "node:test";
import { normalizeDraftText, parseDraftOutput } from "../src/lib/draftOutput";

const longBody =
  "1. PURPOSE\n\nThis agreement is between [PARTY A] and [PARTY B]. It covers [SCOPE OF WORK] in full detail.\n\n2. TERM\n\nStarts on [EFFECTIVE DATE].";

// These fixtures are hand-written test data. They are NOT AI output.
test("parses a valid { title, body } object", () => {
  const draft = parseDraftOutput(JSON.stringify({ title: "Service Agreement", body: longBody }));
  assert.equal(draft?.title, "Service Agreement");
  assert.ok(draft?.body.includes("[EFFECTIVE DATE]"));
});

test("accepts JSON wrapped in a code fence", () => {
  const raw = "```json\n" + JSON.stringify({ title: "T", body: longBody }) + "\n```";
  assert.ok(parseDraftOutput(raw));
});

test("rejects invalid JSON, wrong shapes and tiny bodies", () => {
  assert.equal(parseDraftOutput("not json"), null);
  assert.equal(parseDraftOutput("[]"), null);
  assert.equal(parseDraftOutput(JSON.stringify({ title: "T" })), null);
  assert.equal(parseDraftOutput(JSON.stringify({ title: 5, body: longBody })), null);
  assert.equal(parseDraftOutput(JSON.stringify({ title: "T", body: "too short" })), null);
  assert.equal(parseDraftOutput(""), null);
});

test("normalizes markdown and look-alike characters", () => {
  const out = normalizeDraftText("## 1. TERMS\r\n\r\n\r\n\r\n**Bold** and a\u2011hyphen\u200b.");
  assert.equal(out, "1. TERMS\n\nBold and a-hyphen.");
});
