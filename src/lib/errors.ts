import type { FieldErrors } from "@/types/document";

/**
 * Every error the app can show, with a plain-language message and the HTTP
 * status the server uses. Technical details go to server logs, never to users.
 */
export const ERRORS = {
  invalid_request: {
    status: 400,
    message: "We couldn't read that request. Refresh the page and try again.",
  },
  validation_failed: {
    status: 422,
    message: "Some details need attention. Check the highlighted fields.",
  },
  payload_too_large: {
    status: 413,
    message: "That request is too large. Shorten the text and try again.",
  },
  rate_limited: {
    status: 429,
    message:
      "You've made several requests quickly. Please wait a minute and try again.",
  },
  ai_not_configured: {
    status: 503,
    message:
      "AI drafting isn't set up on this server yet. The site owner needs to add a valid Gemini API key.",
  },
  ai_key_rejected: {
    status: 503,
    message:
      "The AI service rejected this server's API key. The site owner should check the key.",
  },
  ai_model_unavailable: {
    status: 503,
    message:
      "The configured AI model isn't available. The site owner should check the model name.",
  },
  ai_quota: {
    status: 429,
    message:
      "The AI service has reached its usage limit for now (free keys have low limits). Please wait a minute and try again.",
  },
  ai_busy: {
    status: 503,
    message: "The drafting service is busy. Please try again in a moment.",
  },
  ai_timeout: {
    status: 504,
    message: "Drafting took too long. Please try again.",
  },
  ai_unavailable: {
    status: 502,
    message: "We couldn't reach the AI service. Please try again shortly.",
  },
  ai_blocked: {
    status: 422,
    message:
      "The AI service declined to draft this. Try rewording the details and generate again.",
  },
  ai_bad_output: {
    status: 502,
    message: "We couldn't produce a usable draft. Please try again.",
  },
  pdf_unsupported_chars: {
    status: 422,
    message: "The PDF can't include some of the characters in this document.",
  },
  pdf_failed: {
    status: 500,
    message:
      "We couldn't create the PDF. Your edits are still here, so please try again.",
  },
  // Used only in the browser, when the server could not be reached at all.
  network: {
    status: 0,
    message:
      "We couldn't reach the server. Check your internet connection and try again.",
  },
  unknown: {
    status: 500,
    message: "Something went wrong. Please try again.",
  },
} as const;

export type ErrorCode = keyof typeof ERRORS;

interface AppErrorOptions {
  /** Overrides the default message for this code. */
  message?: string;
  fieldErrors?: FieldErrors;
  retryAfterSeconds?: number;
}

/** An error we expect and know how to explain to the user. */
export class AppError extends Error {
  readonly code: ErrorCode;
  readonly fieldErrors?: FieldErrors;
  readonly retryAfterSeconds?: number;

  constructor(code: ErrorCode, options: AppErrorOptions = {}) {
    super(options.message ?? ERRORS[code].message);
    this.name = "AppError";
    this.code = code;
    this.fieldErrors = options.fieldErrors;
    this.retryAfterSeconds = options.retryAfterSeconds;
  }

  get status(): number {
    return ERRORS[this.code].status;
  }
}
