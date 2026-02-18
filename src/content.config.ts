import { defineCollection, z } from 'astro:content'
import { glob } from 'astro/loaders'

const work = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/work' }),
  schema: z.object({
    title: z.string(),
    client: z.string(),
    year: z.number(),
    role: z.string(),
    agency: z.string().default('Razorfish'),
    tagline: z.string(),
    thumbnail: z.string(),
    heroImage: z.string(),
    heroImageAlt: z.string().optional(),
    featured: z.boolean().default(true),
    sortOrder: z.number(),
    tags: z.array(z.string()).default([]),
    metrics: z.array(z.object({
      value: z.string(),
      label: z.string(),
    })).default([]),
  }),
})

export const collections = { work }
