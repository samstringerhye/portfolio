import { defineCollection, z } from 'astro:content'
import { glob } from 'astro/loaders'

const work = defineCollection({
  loader: glob({ pattern: '**/*.{md,mdx}', base: './src/content/work' }),
  schema: ({ image }) => z.object({
    title: z.string(),
    client: z.string(),
    year: z.number(),
    role: z.string(),
    agency: z.string(),
    tagline: z.string(),
    thumbnail: image(),
    heroImage: image(),
    heroImageAlt: z.string(),
    featured: z.boolean().default(false),
    sortOrder: z.number().default(999),
    tags: z.array(z.string()).optional(),
  }),
})

export const collections = { work }
