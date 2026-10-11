import type { FormEvent } from "react";
import { DOCUMENT_TYPES } from "@/lib/documentTypes";
import { LIMITS } from "@/lib/schemas";
import type { DraftFormValues, FieldErrors } from "@/types/document";
import { Alert } from "@/components/ui/Alert";
import { Spinner } from "@/components/ui/Spinner";
import { TextField } from "@/components/ui/TextField";
import { DocumentTypePicker } from "./DocumentTypePicker";

interface DraftFormProps {
  values: DraftFormValues;
  errors: FieldErrors;
  /** True while a draft is being generated. */
  isSubmitting: boolean;
  /** A problem from the last attempt to generate (shown above the button). */
  submitError?: string;
  onFieldChange: <K extends keyof DraftFormValues>(
    key: K,
    value: DraftFormValues[K],
  ) => void;
  onSubmit: () => void;
}

/**
 * The input form. It holds no state of its own: the parent owns the values,
 * so the same data can later be sent to the server.
 */
export function DraftForm({
  values,
  errors,
  isSubmitting,
  submitError,
  onFieldChange,
  onSubmit,
}: DraftFormProps) {
  const config = DOCUMENT_TYPES[values.documentType];
  const hasErrors = Object.values(errors).some(Boolean);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    onSubmit();
  }

  return (
    <form
      onSubmit={handleSubmit}
      noValidate
      className="space-y-5 rounded border border-rule bg-paper p-4 sm:p-6"
    >
      <DocumentTypePicker
        value={values.documentType}
        onChange={(type) => onFieldChange("documentType", type)}
      />

      <div className="grid gap-x-4 sm:grid-cols-2 lg:grid-cols-1">
        <TextField
          id="field-partyA"
          label={config.partyALabel}
          placeholder={config.partyAPlaceholder}
          value={values.partyA}
          error={errors.partyA}
          onChange={(value) => onFieldChange("partyA", value)}
          autoComplete="organization"
        />
        <TextField
          id="field-partyB"
          label={config.partyBLabel}
          placeholder={config.partyBPlaceholder}
          value={values.partyB}
          error={errors.partyB}
          onChange={(value) => onFieldChange("partyB", value)}
        />
      </div>

      <TextField
        id="field-jurisdiction"
        label="Governing jurisdiction"
        hint="The country, state or region whose law should apply."
        placeholder="For example: England and Wales"
        value={values.jurisdiction}
        error={errors.jurisdiction}
        onChange={(value) => onFieldChange("jurisdiction", value)}
      />

      <TextField
        id="field-purpose"
        label={config.purposeLabel}
        hint={config.purposeHint}
        placeholder={config.purposePlaceholder}
        multiline
        rows={3}
        maxChars={LIMITS.purpose}
        value={values.purpose}
        error={errors.purpose}
        onChange={(value) => onFieldChange("purpose", value)}
      />

      <TextField
        id="field-extraDetails"
        label="Extra details"
        optional
        hint={config.extraDetailsHint}
        multiline
        rows={4}
        maxChars={LIMITS.extraDetails}
        value={values.extraDetails}
        error={errors.extraDetails}
        onChange={(value) => onFieldChange("extraDetails", value)}
      />

      <p className="text-sm text-muted">
        Avoid entering ID numbers, bank details or passwords. Anything you type
        here is sent to an AI service to write the draft.
      </p>

      {hasErrors ? (
        <Alert tone="error" title="Some details need attention">
          Check the highlighted fields and try again.
        </Alert>
      ) : null}

      {submitError ? (
        <Alert tone="error" title="We couldn't create your draft">
          {submitError}
        </Alert>
      ) : null}

      <button
        type="submit"
        disabled={isSubmitting}
        aria-busy={isSubmitting}
        className="w-full rounded bg-accent px-4 py-2.5 text-sm font-semibold text-white hover:bg-accent-strong focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent disabled:cursor-not-allowed disabled:opacity-60"
      >
        {isSubmitting ? (
          <span className="inline-flex items-center justify-center gap-2">
            <Spinner className="size-4" />
            Generating draft…
          </span>
        ) : (
          "Generate draft"
        )}
      </button>
    </form>
  );
}
