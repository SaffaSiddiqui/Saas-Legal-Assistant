import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Legal Drafting Assistant",
  description:
    "Create a first draft of common legal documents with AI assistance, then edit and export it.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="flex min-h-full flex-col">{children}</body>
    </html>
  );
}
