"use client";

import { useEffect, useRef, useState } from "react";
import { DOCUMENT_TYPES, type DocumentTypeId } from "@/lib/documentTypes";
import { downloadBlob, requestDraft, requestPdf } from "@/lib/api";
import { findUnsupportedPdfChars, unsupportedCharsMessage } from "@/lib/pdfText";
import {
  FIELD_ORDER,
  validateDraftRequest,
  validateExportRequest,
} from "@/lib/schemas";
import type {
  DraftDocument,
  DraftFormValues,
  FieldErrors,
} from "@/types/document";
import { DraftForm } from "@/components/forms/DraftForm";
import { DocumentSheet, type SheetView } from "@/components/preview/DocumentSheet";
import { DraftToolbar } from "@/components/preview/DraftToolbar";
import { Alert } from "@/components/ui/Alert";

const INITIAL_VALUES: DraftFormValues = {
  documentType: "nda",
  partyA: "",
  partyB: "",
  jurisdiction: "",
  purpose: "",
  extraDetails: "",
};

/** Counts placeholders such as [EFFECTIVE DATE] that the user still has to fill in. */
function countPlaceholders(text: string): number {
  return text.match(/\[[A-Z0-9][A-Z0-9 _\-/,.&'()]*\]/g)?.length ?? 0;
}

/** On phones the draft sits below the form, so bring it into view. */
function scrollIntoViewOnSmallScreens(element: HTMLElement | null) {
  if (!element || window.matchMedia("(min-width: 1024px)").matches) return;
  element.scrollIntoView({ behavior: "auto", block: "start" });
}

type Progress =
  | { status: "idle" }
  | { status: "working" }
  | { status: "error"; message: string };

/**
 * The dashboard's interactive area. It owns:
 *  - the form values,
 *  - the current draft text (including the user's edits), and
 *  - the loading and error state of drafting and exporting.
 */
export function Workspace() {
  const [values, setValues] = useState<DraftFormValues>(INITIAL_VALUES);
  const [errors, setErrors] = useState<FieldErrors>({});

  // The current text in the editor. Every keystroke updates this.
  const [draft, setDraft] = useState<DraftDocument | null>(null);
  // The text exactly as the AI produced it, used to tell whether the user edited it.
  const [generated, setGenerated] = useState<DraftDocument | null>(null);
  const [draftTypeId, setDraftTypeId] = useState<DocumentTypeId>("nda");

  const [generation, setGeneration] = useState<Progress>({ status: "idle" });
  const [exporting, setExporting] = useState<Progress>({ status: "idle" });
  const [announcement, setAnnouncement] = useState("");
  // Increases each time a draft arrives, so we can scroll to it once it has rendered.
  const [draftsReceived, setDraftsReceived] = useState(0);
  const sheetRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (draftsReceived > 0) scrollIntoViewOnSmallScreens(sheetRef.current);
  }, [draftsReceived]);

  const isGenerating = generation.status === "working";
  const isExporting = exporting.status === "working";
  const isEdited =
    draft !== null &&
    generated !== null &&
    (draft.title !== generated.title || draft.body !== generated.body);

  let view: SheetView = "empty";
  if (isGenerating) view = "loading";
  else if (draft) view = "editor";

  const sheetTypeLabel = DOCUMENT_TYPES[draft ? draftTypeId : values.documentType].label;

  function handleFieldChange<K extends keyof DraftFormValues>(
    key: K,
    value: DraftFormValues[K],
  ) {
    setValues((current) => ({ ...current, [key]: value }));
    // Clear a field's error as soon as the user starts fixing it.
    setErrors((current) => (current[key] ? { ...current, [key]: undefined } : current));
  }

  function focusFirstInvalid(fieldErrors: FieldErrors) {
    const firstInvalid = FIELD_ORDER.find((key) => fieldErrors[key]);
    if (!firstInvalid) return;
    const id =
      firstInvalid === "documentType"
        ? `field-documentType-${values.documentType}`
        : `field-${firstInvalid}`;
    document.getElementById(id)?.focus();
  }

  async function handleGenerate() {
    if (isGenerating) return;

    const result = validateDraftRequest(values);
    if (!result.ok) {
      setErrors(result.errors);
      focusFirstInvalid(result.errors);
      return;
    }
    setErrors({});

    if (
      isEdited &&
      !window.confirm(
        "Generating a new draft will replace the edits you made to the current one. Continue?",
      )
    ) {
      return;
    }

    setGeneration({ status: "working" });
    setExporting({ status: "idle" });
    scrollIntoViewOnSmallScreens(sheetRef.current);

    const response = await requestDraft(result.data);

    if (!response.ok) {
      const fieldErrors = response.error.fieldErrors;
      if (fieldErrors && Object.keys(fieldErrors).length > 0) {
        setErrors(fieldErrors);
        focusFirstInvalid(fieldErrors);
      }
      // The previous draft (if any) is kept, so nothing the user wrote is lost.
      setGeneration({ status: "error", message: response.error.message });
      return;
    }

    setDraft(response.draft);
    setGenerated(response.draft);
    setDraftTypeId(result.data.documentType);
    setGeneration({ status: "idle" });
    setDraftsReceived((count) => count + 1);
    setAnnouncement(
      "Your draft is ready. Review it and replace the placeholders in square brackets.",
    );
  }

  async function handleExport() {
    if (!draft || isExporting) return;

    const check = validateExportRequest(draft);
    if (!check.ok) {
      setExporting({ status: "error", message: check.message });
      return;
    }

    const unsupported = findUnsupportedPdfChars(`${check.data.title}\n${check.data.body}`);
    if (unsupported.length > 0) {
      setExporting({ status: "error", message: unsupportedCharsMessage(unsupported) });
      return;
    }

    setExporting({ status: "working" });
    const response = await requestPdf(check.data);

    if (!response.ok) {
      setExporting({ status: "error", message: response.error.message });
      return;
    }

    downloadBlob(response.blob, response.filename);
    setExporting({ status: "idle" });
    setAnnouncement(`PDF downloaded as ${response.filename}.`);
  }

  return (
    <div className="mt-6 grid gap-6 lg:grid-cols-[minmax(0,27rem)_minmax(0,1fr)] lg:items-start">
      <DraftForm
        values={values}
        errors={errors}
        isSubmitting={isGenerating}
        submitError={generation.status === "error" ? generation.message : undefined}
        onFieldChange={handleFieldChange}
        onSubmit={handleGenerate}
      />

      <div ref={sheetRef} className="scroll-mt-4 space-y-4">
        {view === "editor" && draft ? (
          <DraftToolbar
            isEdited={isEdited}
            placeholderCount={countPlaceholders(draft.title + "\n" + draft.body)}
            isExporting={isExporting}
            onExport={handleExport}
          />
        ) : null}

        {exporting.status === "error" ? (
          <Alert tone="error" title="We couldn't export the PDF">
            {exporting.message}
          </Alert>
        ) : null}

        <DocumentSheet
          documentTypeLabel={sheetTypeLabel}
          view={view}
          draft={draft}
          onDraftChange={setDraft}
        />
      </div>

      {/* Announces results to screen-reader users. */}
      <p className="sr-only" role="status" aria-live="polite">
        {announcement}
      </p>
    </div>
  );
}
