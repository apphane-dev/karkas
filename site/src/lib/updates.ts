import { getCollection, type CollectionEntry } from 'astro:content'

/**
 * Build-time feature flag for seed/example content.
 *
 * Default (env unset) = hidden, so production builds ship none of the example
 * update entries. A dev or preview build opts in with
 * `SHOW_EXAMPLES=1 npx astro build`. Read from the build-time environment
 * (`process.env`, populated in Node during `astro build`); compared as a string
 * so an unset var is falsy. Non-prefixed vars are not reliably surfaced on
 * `import.meta.env` inside plain modules across Astro versions, so we read
 * `process.env` directly.
 */
export const SHOW_EXAMPLES = process.env.SHOW_EXAMPLES === '1'

/**
 * Project updates, newest first. This is the single choke point where example/
 * seed entries are filtered out — hidden unless SHOW_EXAMPLES is set.
 */
export async function getUpdates(): Promise<CollectionEntry<'updates'>[]> {
	const updates = await getCollection('updates', ({ data }) =>
		SHOW_EXAMPLES ? true : !data.example,
	)
	return updates.sort((a, b) => b.data.date.valueOf() - a.data.date.valueOf())
}
