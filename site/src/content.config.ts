import { defineCollection, z } from 'astro:content'
import { glob } from 'astro/loaders'

// Narrative project updates — the editorial feed described in the brief.
// Formal versioned notes live in GitHub Releases; these entries explain
// decisions: what changed, the problem it solves, and where to inspect it.
const updates = defineCollection({
	loader: glob({ pattern: '**/*.md', base: './src/content/updates' }),
	schema: z.object({
		title: z.string(),
		date: z.coerce.date(),
		summary: z.string(),
		tag: z.enum(['deployment', 'testing', 'architecture', 'tooling', 'design']),
		link: z.string().optional(),
		linkLabel: z.string().optional(),
		// Seed entries ship as examples; flag them so they read as placeholders.
		example: z.boolean().default(false),
	}),
})

export const collections = { updates }
