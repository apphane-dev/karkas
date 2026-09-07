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
