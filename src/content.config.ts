import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

const blog = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/blog' }),
  schema: ({ image }) =>
    z.object({
      title: z.string().max(70),
      description: z.string().min(50).max(160),
      date: z.coerce.date(),
      updated: z.coerce.date().optional(),
      category: z.enum(['mcp-agentes', 'apis-integracao', 'bastidores']),
      tags: z.array(z.string()).default([]),
      series: z
        .object({
          slug: z.string(),
          order: z.number().int().positive(),
        })
        .optional(),
      cover: image().optional(),
      featured: z.boolean().default(false),
      draft: z.boolean().default(false),
    }),
});

export const collections = { blog };
