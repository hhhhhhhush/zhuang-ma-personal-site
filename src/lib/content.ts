import { getCollection, type CollectionEntry } from 'astro:content';
import profileData from '../../data/profile.json';
import settings from '../../data/site-config.json';
import socialsData from '../../data/social-links.json';
import resourcesData from '../../data/resources.json';
import { z } from 'astro/zod';
import { withBase } from './markdown-paths.mjs';
const webUrl = z.union([
  z.url().refine((v) => /^https?:\/\//.test(v), 'Only HTTP(S) URLs allowed'),
  z.literal(''),
]);
const imagePath = z
  .string()
  .refine(
    (v) => !v || /^\/(?!\/)/.test(v) || /^https?:\/\//.test(v),
    'Use a root-relative media path or HTTP(S) URL',
  );
export const navigation = z
  .array(
    z.object({
      label: z.string(),
      path: z.string().regex(/^\/(?!\/)[^?#]*\/?$|^\/$/, 'Use a root-relative site path'),
    }),
  )
  .parse((await import('../../data/navigation.json')).default);
export const profile = z
  .object({
    nameZh: z.string(),
    nameEn: z.string(),
    avatar: imagePath,
    bio: z.string(),
    heroTitle: z.string(),
    heroSubtitle: z.string(),
    introduction: z.string(),
    introductionZh: z.string(),
    introductionEn: z.string(),
    email: z.union([z.email(), z.literal('')]),
    github: webUrl,
    skills: z.array(z.string()),
    interests: z.array(z.string()),
    focus: z.array(z.string()),
    learning: z.array(z.string()),
    experiences: z.array(
      z.object({ period: z.string(), title: z.string(), description: z.string() }),
    ),
  })
  .parse(profileData);
export const site = z
  .object({
    name: z.string(),
    description: z.string(),
    logo: imagePath,
    favicon: imagePath,
    defaultAvatar: imagePath,
    seoTitle: z.string(),
    ogImage: imagePath,
    language: z.string(),
    theme: z.enum(['system', 'light', 'dark']),
    copyright: z.string(),
    knowledgeCategories: z.array(z.string()),
    resourceCategories: z.array(z.string()),
  })
  .parse(settings);
export const socials = z
  .array(z.object({ label: z.string(), url: webUrl }))
  .parse(socialsData)
  .filter((s) => s.url);
export const resources = z
  .array(
    z.object({
      name: z.string(),
      description: z.string(),
      url: webUrl,
      icon: z.string(),
      category: z.string(),
      recommended: z.boolean(),
      iconImage: imagePath.optional(),
    }),
  )
  .parse(resourcesData)
  .filter((r) => r.url);
export const url = (path = '/') => withBase(path, import.meta.env.BASE_URL);
export const dateLabel = (date: Date) =>
  new Intl.DateTimeFormat('en', {
    month: 'short',
    day: '2-digit',
    year: 'numeric',
    timeZone: 'UTC',
  }).format(date);
export const isPublished = (entry: { data: { status: string; date: Date } }) =>
  entry.data.status === 'published' && entry.data.date <= new Date();
export async function posts() {
  return (await getCollection('blog', isPublished)).sort(
    (a, b) => b.data.date.valueOf() - a.data.date.valueOf(),
  );
}
export async function notes() {
  return (await getCollection('knowledge', isPublished)).sort(
    (a, b) => b.data.date.valueOf() - a.data.date.valueOf(),
  );
}
export async function projects() {
  return (await getCollection('projects', isPublished)).sort((a, b) => a.data.order - b.data.order);
}
export type Writing = CollectionEntry<'blog'> | CollectionEntry<'knowledge'>;
