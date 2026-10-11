import type { ReactNode } from "react";

type Tone = "error" | "info";

interface AlertProps {
  tone: Tone;
  title: string;
  children?: ReactNode;
}

const TONE_CLASSES: Record<Tone, string> = {
  error: "border-danger/40 bg-danger-soft text-danger",
  info: "border-notice-edge bg-notice text-ink",
};

/** A short message box. Errors are announced immediately by screen readers. */
export function Alert({ tone, title, children }: AlertProps) {
  return (
    <div
      role={tone === "error" ? "alert" : "status"}
      className={`rounded border px-3 py-2.5 text-sm ${TONE_CLASSES[tone]}`}
    >
      <p className="font-semibold">{title}</p>
      {children ? <div className="mt-0.5 text-ink/90">{children}</div> : null}
    </div>
  );
}
