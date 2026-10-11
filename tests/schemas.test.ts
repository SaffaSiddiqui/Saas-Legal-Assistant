import assert from "node:assert/strict";
import { test } from "node:test";
import { LIMITS, validateDraftRequest, validateExportRequest } from "../src/lib/schemas";

const valid = {
  documentType: "nda",
  partyA: "  Acme Ltd ",
  partyB: "Beta LLC",
  jurisdiction: "England and Wales",
  purpose: "Evaluate a possible partnership.",
  extraDetails: "",
};

test("accepts valid input and trims whitespace", () => {
  const result = validateDraftRequest(valid);
  assert.equal(result.ok, true);
  if (result.ok) assert.equal(result.data.partyA, "Acme Ltd");
});

test("reports one message per invalid field", () => {
  const result = validateDraftRequest({ ...valid, partyA: " ", purpose: "short" });
  assert.equal(result.ok, false);
  if (!result.ok) {
    assert.ok(result.errors.partyA);
    assert.ok(result.errors.purpose);
    assert.equal(result.errors.partyB, undefined);
  }
});

test("rejects unknown document types", () => {
  const result = validateDraftRequest({ ...valid, documentType: "will" });
  assert.equal(result.ok, false);
  if (!result.ok) assert.ok(result.errors.documentType);
});

test("rejects oversized fields", () => {
  const result = validateDraftRequest({
    ...valid,
    extraDetails: "x".repeat(LIMITS.extraDetails + 1),
  });
  assert.equal(result.ok, false);
});

test("rejects non-object input without crashing", () => {
  for (const input of [null, undefined, "text", 42, []]) {
    assert.equal(validateDraftRequest(input).ok, false);
  }
});

test("export validation requires a title and text", () => {
  assert.equal(validateExportRequest({ title: "A", body: "B" }).ok, true);
  assert.equal(validateExportRequest({ title: " ", body: "B" }).ok, false);
  assert.equal(validateExportRequest({ title: "A", body: "" }).ok, false);
  assert.equal(validateExportRequest({ title: "A", body: "x".repeat(60_001) }).ok, false);
});
