import { Document, Page, StyleSheet, Text, View } from "@react-pdf/renderer";
import type { DraftDocument } from "@/types/document";
import { isHeadingLine, splitIntoBlocks } from "./layout";

/**
 * The PDF layout. It uses the built-in Times and Helvetica fonts, an A4 page
 * with 1-inch margins, a draft notice and page numbers on every page.
 */

const MARGIN = 72; // points; 72 pt = 1 inch
const PAGE_HEIGHT = 841.89; // A4 height in points
// The footer is placed with `top`, not `bottom`: react-pdf resolves `bottom`
// against the whole unpaginated content height, which put it far off the page.
const FOOTER_TOP = PAGE_HEIGHT - 62;

const styles = StyleSheet.create({
  page: {
    paddingTop: MARGIN,
    paddingBottom: MARGIN + 10,
    paddingHorizontal: MARGIN,
    fontFamily: "Times-Roman",
    fontSize: 11.5,
    lineHeight: 1.5,
    color: "#111111",
  },
  title: {
    fontFamily: "Times-Bold",
    fontSize: 18,
    lineHeight: 1.3,
    textAlign: "center",
    marginBottom: 24,
  },
  block: {
    marginBottom: 10,
  },
  heading: {
    fontFamily: "Times-Bold",
    marginTop: 4,
  },
  footer: {
    position: "absolute",
    left: MARGIN,
    right: MARGIN,
    top: FOOTER_TOP,
    flexDirection: "row",
    justifyContent: "space-between",
    borderTopWidth: 0.5,
    borderTopColor: "#999999",
    paddingTop: 6,
    fontFamily: "Helvetica",
    fontSize: 8,
    lineHeight: 1.2,
    color: "#555555",
  },
});

export function DocumentPdf({ title, body }: DraftDocument) {
  const blocks = splitIntoBlocks(body);

  return (
    <Document
      title={title}
      author="Legal Drafting Assistant"
      creator="Legal Drafting Assistant"
      producer="Legal Drafting Assistant"
      language="en"
    >
      <Page size="A4" style={styles.page}>
        <Text style={styles.title}>{title}</Text>

        {blocks.map((lines, blockIndex) => (
          <View key={blockIndex} style={styles.block}>
            {lines.map((line, lineIndex) =>
              isHeadingLine(line) ? (
                <Text
                  key={lineIndex}
                  style={styles.heading}
                  minPresenceAhead={60}
                >
                  {line}
                </Text>
              ) : (
                <Text key={lineIndex}>{line === "" ? " " : line}</Text>
              ),
            )}
          </View>
        ))}

        <View style={styles.footer} fixed>
          <Text>
            AI-assisted draft. Not legal advice. Have a qualified lawyer review
            it before use.
          </Text>
          <Text
            render={({ pageNumber, totalPages }) =>
              `Page ${pageNumber} of ${totalPages}`
            }
          />
        </View>
      </Page>
    </Document>
  );
}
