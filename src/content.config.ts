import { defineCollection } from 'astro:content';
import { z } from 'astro/zod';
import { glob } from 'astro/loaders';

const common = {
  title: z.string(),
  description: z.string(),
  date: z.coerce.date(),
  updated: z.coerce.date().optional(),
  status: z.enum(['draft', 'published', 'unlisted']).default('draft'),
  category: z.string(),
  tags: z.array(z.string()).default([]),
  featured: z.boolean().default(false),
  cover: z
    .string()
    .refine(
      (v) => !v || /^\/(?!\/)/.test(v) || /^https?:\/\//.test(v),
      'Use a local media path or HTTP(S)',
    )
    .optional(),
  seoTitle: z.string().optional(),
  seoDescription: z.string().optional(),
};
const blog = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/blog' }),
  schema: z.object(common),
});
const knowledge = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/knowledge' }),
  schema: z.object({
    ...common,
    maturity: z.enum(['Seedling', 'Growing', 'Evergreen']).default('Seedling'),
  }),
});
const projects = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/projects' }),
  schema: z.object({
    ...common,
    projectStatus: z.enum(['Planning', 'In Progress', 'Completed', 'Archived']),
    stack: z.array(z.string()).default([]),
    github: z.union([z.url().refine((v) => /^https?:\/\//.test(v)), z.literal('')]).optional(),
    demo: z.union([z.url().refine((v) => /^https?:\/\//.test(v)), z.literal('')]).optional(),
    screenshots: z
      .array(z.string().refine((v) => /^\/(?!\/)/.test(v) || /^https?:\/\//.test(v)))
      .default([]),
    started: z.coerce.date().optional(),
    completed: z.coerce.date().optional(),
    order: z.number().default(0),
  }),
});
export const collections = { blog, knowledge, projects };
