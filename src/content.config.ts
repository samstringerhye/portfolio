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
    featured: z.boolean().default(true),
    sortOrder: z.number(),
    tags: z.array(z.string()).default([]),
    metrics: z.array(z.object({
      value: z.string(),
      label: z.string(),
    })).default([]),
  }),
})

const blog = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/blog' }),
  schema: z.object({
    title: z.string(),
    description: z.string(),
    date: z.coerce.date(),
    published: z.boolean().default(false),
    tags: z.array(z.string()).default([]),
  }),
})

const playground = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/playground' }),
  schema: z.object({
    title: z.string(),
    description: z.string(),
    thumbnail: z.string().optional(),
    url: z.string().optional(),
    tags: z.array(z.string()).default([]),
    sortOrder: z.number().default(0),
  }),
})

export const collections = { work, blog, playground }
