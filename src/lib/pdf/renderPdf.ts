import { renderToBuffer } from "@react-pdf/renderer";
import type { DraftDocument } from "@/types/document";
import { DocumentPdf } from "./DocumentPdf";

/** Renders the document to PDF bytes. */
export async function renderPdf(document: DraftDocument): Promise<Buffer> {
  return renderToBuffer(DocumentPdf(document));
}
