/** Top bar with the product name and a permanent "not legal advice" notice. */
export function AppHeader() {
  return (
    <header>
      <div className="border-b border-rule bg-paper">
        <div className="mx-auto flex w-full max-w-7xl items-center justify-between gap-4 px-4 py-3 sm:px-6 lg:px-8">
          <p className="font-serif text-lg font-semibold tracking-tight">
            Legal Drafting Assistant
          </p>
          <p className="rounded border border-rule px-2 py-0.5 text-xs text-muted">
            MVP preview
          </p>
        </div>
      </div>
      <div className="border-b border-notice-edge bg-notice">
        <p className="mx-auto w-full max-w-7xl px-4 py-2 text-sm sm:px-6 lg:px-8">
          Drafts are created with AI assistance and are not legal advice. Have a
          qualified lawyer review any document before you use or sign it.
        </p>
      </div>
    </header>
  );
}
