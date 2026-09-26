import { getCollection, type CollectionEntry } from "astro:content";

/**
 * Solved-problem catalog, in porting order. Every published entry names the
 * code it ships in; an entry without a repo file pointer cannot pass review.
 *
 * Dev-only until the section ships: `astro dev` gets the catalog, production
 * builds get an empty list, so the landing section hides and entry pages are
 * not generated.
 */
export async function getPatterns(): Promise<CollectionEntry<"patterns">[]> {
	if (!import.meta.env.DEV) return [];
	const patterns = await getCollection("patterns");
	return patterns.sort((a, b) => a.data.order - b.data.order);
}

const escapeHtml = (text: string) =>
	text.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

/**
 * Frontmatter `problem`/`decision` skip the Markdown pipeline, so backticked
 * identifiers would print literally. Returns escaped HTML for `set:html`.
 */
export const inlineCode = (text: string) =>
	escapeHtml(text).replace(/`([^`]+)`/g, "<code>$1</code>");

/** The same text with backticks dropped, for `<meta>` descriptions. */
export const plainText = (text: string) => text.replace(/`/g, "");
