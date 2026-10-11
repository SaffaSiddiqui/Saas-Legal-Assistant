import { Spinner } from "@/components/ui/Spinner";

interface DraftToolbarProps {
  isEdited: boolean;
  placeholderCount: number;
  isExporting: boolean;
  onExport: () => void;
}

/** Status line and Export PDF button shown above the draft. */
export function DraftToolbar({
  isEdited,
  placeholderCount,
  isExporting,
  onExport,
}: DraftToolbarProps) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-3 rounded border border-rule bg-paper px-4 py-3">
      <div className="min-w-0">
        <p className="text-sm font-semibold">
          AI-generated draft{isEdited ? " (edited)" : ""}
        </p>
        <p className="text-sm text-muted">
          {placeholderCount > 0
            ? `${placeholderCount} ${
                placeholderCount === 1 ? "placeholder" : "placeholders"
              } in [brackets] still need your details.`
            : "No bracketed placeholders left. Still review every clause."}
        </p>
      </div>
      <button
        type="button"
        onClick={onExport}
        disabled={isExporting}
        className="inline-flex items-center gap-2 rounded bg-ink px-4 py-2 text-sm font-semibold text-white hover:bg-ink/90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink disabled:cursor-not-allowed disabled:opacity-60"
      >
        {isExporting ? (
          <>
            <Spinner className="size-4" />
            Preparing PDF…
          </>
        ) : (
          "Export PDF"
        )}
      </button>
    </div>
  );
}
