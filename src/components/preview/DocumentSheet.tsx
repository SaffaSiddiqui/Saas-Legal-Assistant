import { EXPORT_LIMITS } from "@/lib/schemas";
import type { DraftDocument } from "@/types/document";
import { Spinner } from "@/components/ui/Spinner";

export type SheetView = "empty" | "loading" | "editor";

interface DocumentSheetProps {
  /** Name of the document type, shown above the title. */
  documentTypeLabel: string;
  view: SheetView;
  draft: DraftDocument | null;
  onDraftChange: (draft: DraftDocument) => void;
}

/**
 * The "sheet of paper". It shows one of three things: an empty state, a
 * loading message while the AI works, or the editable draft. The text lives in
 * the parent's state, so what you see here is exactly what gets exported.
 */
export function DocumentSheet({
  documentTypeLabel,
  view,
  draft,
  onDraftChange,
}: DocumentSheetProps) {
  return (
    <section
      aria-labelledby="sheet-heading"
      aria-busy={view === "loading"}
      className="relative flex min-h-[26rem] flex-col overflow-hidden rounded border border-rule bg-paper shadow-sm sm:min-h-[34rem]"
    >
      {/* Legal-pad margin line: decorative only. */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-y-0 left-8 w-px bg-accent/25 sm:left-14"
      />

      <div className="relative pr-4 pt-8 pl-12 sm:pr-10 sm:pt-10 sm:pl-20">
        <p id="sheet-heading" className="text-sm text-muted">
          Draft preview · {documentTypeLabel}
        </p>

        {view === "editor" && draft ? (
          <>
            <label htmlFor="draft-title" className="sr-only">
              Document title
            </label>
            <input
              id="draft-title"
              type="text"
              value={draft.title}
              onChange={(event) =>
                onDraftChange({ ...draft, title: event.target.value })
              }
              maxLength={EXPORT_LIMITS.title}
              className="mt-2 block w-full rounded border border-transparent bg-transparent px-0 py-1 font-serif text-2xl font-semibold tracking-tight hover:border-rule focus:border-rule focus:outline-2 focus:outline-offset-2 focus:outline-accent sm:text-3xl"
            />
          </>
        ) : (
          <h2 className="mt-2 font-serif text-2xl font-semibold tracking-tight sm:text-3xl">
            {view === "loading" ? "Drafting your document…" : documentTypeLabel}
          </h2>
        )}
      </div>

      {view === "editor" && draft ? (
        <div className="relative flex-1 pr-4 pb-10 pl-12 pt-6 sm:pr-10 sm:pb-12 sm:pl-20">
          <label htmlFor="draft-body" className="sr-only">
            Document text. Edit it freely before exporting.
          </label>
          <textarea
            id="draft-body"
            value={draft.body}
            onChange={(event) =>
              onDraftChange({ ...draft, body: event.target.value })
            }
            spellCheck
            className="field-sizing-content block min-h-[26rem] w-full resize-y rounded border border-transparent bg-transparent p-0 font-serif text-base leading-8 text-ink [background-image:repeating-linear-gradient(to_bottom,transparent_0,transparent_31px,var(--color-rule)_31px,var(--color-rule)_32px)] [background-attachment:local] [background-origin:content-box] hover:border-rule focus:border-rule focus:outline-2 focus:outline-offset-2 focus:outline-accent"
          />
          <p className="mt-2 text-xs text-muted">
            {draft.body.length.toLocaleString("en-US")} /{" "}
            {EXPORT_LIMITS.body.toLocaleString("en-US")} characters
          </p>
        </div>
      ) : (
        <>
          <div className="relative pr-4 pl-12 sm:pr-10 sm:pl-20">
            {view === "loading" ? (
              <div role="status" className="mt-10 max-w-md font-serif">
                <p className="flex items-center gap-3 text-lg font-semibold">
                  <Spinner className="size-5 text-accent" />
                  Writing a first draft
                </p>
                <p className="mt-1 leading-relaxed text-muted">
                  This can take up to a minute. Please keep this page open.
                </p>
              </div>
            ) : (
              <div className="mt-10 max-w-md font-serif">
                <p className="text-lg font-semibold">No draft yet</p>
                <p className="mt-1 leading-relaxed text-muted">
                  Fill in the details and select Generate draft. The draft will
                  appear here as text you can edit, and you can export it as a
                  PDF when you are happy with it.
                </p>
              </div>
            )}
          </div>

          {/* Faint ruled lines fill the rest of the sheet: decorative only. */}
          <div
            aria-hidden="true"
            className="mt-10 flex-1 bg-[repeating-linear-gradient(to_bottom,transparent_0,transparent_31px,var(--color-rule)_31px,var(--color-rule)_32px)] opacity-70"
          />
        </>
      )}
    </section>
  );
}
