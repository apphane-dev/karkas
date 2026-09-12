import { getCollection, type CollectionEntry } from "astro:content";

/**
 * Solved-problem catalog, in porting order. Every published entry names the
 * code it ships in; an entry without a repo file pointer cannot pass review.
 */
export async function getPatterns(): Promise<CollectionEntry<"patterns">[]> {
	const patterns = await getCollection("patterns");
	return patterns.sort((a, b) => a.data.order - b.data.order);
}
