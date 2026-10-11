interface TextFieldProps {
  /** The field's DOM id. Also used to focus the field when validation fails. */
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  hint?: string;
  error?: string;
  placeholder?: string;
  optional?: boolean;
  /** Renders a multi-line box. */
  multiline?: boolean;
  rows?: number;
  /** Shows a "n / max" counter (does not block typing; validation reports the error). */
  maxChars?: number;
  autoComplete?: string;
}

/** A labelled input or textarea with hint, error message and optional counter. */
export function TextField({
  id,
  label,
  value,
  onChange,
  hint,
  error,
  placeholder,
  optional,
  multiline,
  rows = 4,
  maxChars,
  autoComplete = "off",
}: TextFieldProps) {
  const hintId = `${id}-hint`;
  const errorId = `${id}-error`;
  const describedBy =
    [hint ? hintId : null, error ? errorId : null].filter(Boolean).join(" ") ||
    undefined;

  const controlClasses = [
    "mt-1.5 block w-full rounded border bg-paper px-3 py-2 text-[0.95rem] text-ink",
    "placeholder:text-muted/70 focus:outline-2 focus:outline-offset-1 focus:outline-accent",
    error ? "border-danger" : "border-rule",
  ].join(" ");

  const commonProps = {
    id,
    name: id,
    value,
    placeholder,
    autoComplete,
    "aria-invalid": error ? true : undefined,
    "aria-describedby": describedBy,
    className: controlClasses,
  };

  const overLimit = maxChars !== undefined && value.length > maxChars;

  return (
    <div>
      <label htmlFor={id} className="block text-sm font-semibold">
        {label}
        {optional ? (
          <span className="ml-1.5 font-normal text-muted">(optional)</span>
        ) : null}
      </label>
      {hint ? (
        <p id={hintId} className="mt-0.5 text-sm text-muted">
          {hint}
        </p>
      ) : null}

      {multiline ? (
        <textarea
          {...commonProps}
          rows={rows}
          onChange={(event) => onChange(event.target.value)}
        />
      ) : (
        <input
          {...commonProps}
          type="text"
          onChange={(event) => onChange(event.target.value)}
        />
      )}

      <div className="mt-1 flex items-start justify-between gap-3">
        <p id={errorId} className="min-h-5 text-sm text-danger">
          {error}
        </p>
        {maxChars !== undefined ? (
          <p
            className={`shrink-0 text-xs tabular-nums ${
              overLimit ? "font-semibold text-danger" : "text-muted"
            }`}
          >
            {value.length} / {maxChars}
          </p>
        ) : null}
      </div>
    </div>
  );
}
