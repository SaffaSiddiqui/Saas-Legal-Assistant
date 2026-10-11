import type { DocumentTypeId } from "@/lib/documentTypes";

/** What the user types into the form. */
export interface DraftFormValues {
  documentType: DocumentTypeId;
  partyA: string;
  partyB: string;
  jurisdiction: string;
  purpose: string;
  extraDetails: string;
}

/** Field name -> error message to show next to that field. */
export type FieldErrors = Partial<Record<keyof DraftFormValues, string>>;

/** The document as plain text. This is what the user edits and what becomes the PDF. */
export interface DraftDocument {
  title: string;
  body: string;
}

/** The error shape every API route returns. */
export interface ApiErrorPayload {
  code: string;
  message: string;
  fieldErrors?: FieldErrors;
}
