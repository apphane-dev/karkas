import { glob } from "astro/loaders";
import { defineCollection, z } from "astro:content";

// Solved-problem catalog: mechanisms proven in production and shipped in the
// template, each entry narrating the decision and pointing at the code.
const patterns = defineCollection({
	loader: glob({ pattern: "**/*.md", base: "./src/content/patterns" }),
	schema: z.object({
		title: z.string(),
		// The failure users would hit without the invention.
		problem: z.string(),
		// The non-obvious choice the invention encodes, in one sentence.
		decision: z.string(),
		tag: z.enum(["forms", "state", "api", "ui", "persistence", "routing"]),
		// Repo paths where the mechanism lives — template first, demo second.
		files: z.array(z.string()).min(1),
		// Path under /demo/ where the behavior is visible in the running app.
		demo: z.string().optional(),
		// Stable sort key so the catalog reads in porting order.
		order: z.number(),
	}),
});

// Narrative project updates — the editorial feed described in the brief.
// Formal versioned notes live in GitHub Releases; these entries explain
// decisions: what changed, the problem it solves, and where to inspect it.
const updates = defineCollection({
	loader: glob({ pattern: "**/*.md", base: "./src/content/updates" }),
	schema: z.object({
		title: z.string(),
		date: z.coerce.date(),
		summary: z.string(),
		tag: z.enum(["deployment", "testing", "architecture", "tooling", "design"]),
		link: z.string().optional(),
		linkLabel: z.string().optional(),
		// Seed entries ship as examples; flag them so they read as placeholders.
		example: z.boolean().default(false),
	}),
});

export const collections = { updates, patterns };
