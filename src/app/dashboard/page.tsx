import type { Metadata } from "next";
import { AppHeader } from "@/components/layout/AppHeader";
import { Workspace } from "@/components/Workspace";

export const metadata: Metadata = {
  title: "New document · Legal Drafting Assistant",
};

export default function DashboardPage() {
  return (
    <>
      <AppHeader />
      <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
        <h1 className="font-serif text-3xl font-semibold tracking-tight">
          New document
        </h1>
        <p className="mt-1 max-w-2xl text-muted">
          Choose a document type and add the basics. You will get a first draft
          to edit and export.
        </p>
        <Workspace />
      </main>
    </>
  );
}
