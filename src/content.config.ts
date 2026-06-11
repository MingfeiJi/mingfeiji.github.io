import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

const articles = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/articles' }),
  schema: z
    .object({
      title: z.string(),
      created: z.coerce.date().optional(),
      tags: z.array(z.string()).default([]),
      word_count: z.number().optional(),
    })
    .passthrough(),
});

const notes = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/notes' }),
  schema: z
    .object({
      title: z.string(),
      category: z.string(),
      created: z.coerce.date().optional(),
    })
    .passthrough(),
});

export const collections = { articles, notes };
