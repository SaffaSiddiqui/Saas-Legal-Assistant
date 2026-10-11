/**
 * The single source of truth for which documents the app supports.
 * The form, the validation schema and (in Stage B) the AI prompts all read from here.
 */

export const DOCUMENT_TYPE_IDS = [
  "nda",
  "service-agreement",
  "business-letter",
] as const;

export type DocumentTypeId = (typeof DOCUMENT_TYPE_IDS)[number];

export interface DocumentTypeConfig {
  id: DocumentTypeId;
  /** Name shown to the user. */
  label: string;
  /** One line explaining what the document is for. */
  description: string;
  partyALabel: string;
  partyAPlaceholder: string;
  partyBLabel: string;
  partyBPlaceholder: string;
  purposeLabel: string;
  purposeHint: string;
  purposePlaceholder: string;
  extraDetailsHint: string;
}

export const DOCUMENT_TYPES: Record<DocumentTypeId, DocumentTypeConfig> = {
  nda: {
    id: "nda",
    label: "Non-disclosure agreement",
    description: "Keep shared business information confidential.",
    partyALabel: "Disclosing party",
    partyAPlaceholder: "Who is sharing information",
    partyBLabel: "Receiving party",
    partyBPlaceholder: "Who is receiving it",
    purposeLabel: "Purpose of the disclosure",
    purposeHint: "Why will confidential information be shared?",
    purposePlaceholder:
      "For example: to evaluate a possible software partnership.",
    extraDetailsHint:
      "Anything specific, such as the duration of confidentiality or what counts as confidential.",
  },
  "service-agreement": {
    id: "service-agreement",
    label: "Service agreement",
    description: "Set out the work, payment and terms between two parties.",
    partyALabel: "Service provider",
    partyAPlaceholder: "Who is doing the work",
    partyBLabel: "Client",
    partyBPlaceholder: "Who is paying for the work",
    purposeLabel: "Services to be provided",
    purposeHint: "What work will the provider do?",
    purposePlaceholder:
      "For example: design and build a five-page marketing website.",
    extraDetailsHint:
      "Payment amount and schedule, deadlines, ownership of the finished work, or how either side can end the agreement.",
  },
  "business-letter": {
    id: "business-letter",
    label: "Formal business letter",
    description: "A clear, professional letter such as a notice or request.",
    partyALabel: "Sender",
    partyAPlaceholder: "Your name or company",
    partyBLabel: "Recipient",
    partyBPlaceholder: "Who the letter is addressed to",
    purposeLabel: "What the letter is about",
    purposeHint: "Describe the main message or request.",
    purposePlaceholder:
      "For example: request payment of an overdue invoice within 14 days.",
    extraDetailsHint:
      "Dates, reference numbers, amounts, or the tone you want (firm, friendly, neutral).",
  },
};

/** Ordered list for rendering the picker. */
export const DOCUMENT_TYPE_LIST: DocumentTypeConfig[] = DOCUMENT_TYPE_IDS.map(
  (id) => DOCUMENT_TYPES[id],
);
