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
      label: z.string().default(''),
      path: z
        .string()
        .regex(/^\/(?!\/)[^?#]*\/?$|^\/$/, 'Use a root-relative site path')
        .default('/'),
    }),
  )
  .default([])
  .parse((await import('../../data/navigation.json')).default);
// Pages CMS 保存 JSON 时会丢弃值为空字符串的键。若这里把这些字段声明为必填，
// 用户在 CMS 里清空任意字段都会导致构建抛 zod 校验错误（GitHub Actions 直接红）。
// 因此所有文本字段都给出默认值，缺省时回落为空串/空数组，由页面自行判断是否渲染。
export const profile = z
  .object({
    nameZh: z.string().default(''),
    nameEn: z.string().default(''),
    avatar: imagePath.default('/images/avatar/monogram.svg'),
    bio: z.string().default(''),
    heroTitle: z.string().default(''),
    heroSubtitle: z.string().default(''),
    introduction: z.string().default(''),
    introductionZh: z.string().default(''),
    introductionEn: z.string().default(''),
    email: z.union([z.email(), z.literal('')]).default(''),
    github: webUrl.default(''),
    skills: z.array(z.string()).default([]),
    interests: z.array(z.string()).default([]),
    focus: z.array(z.string()).default([]),
    learning: z.array(z.string()).default([]),
    experiences: z
      .array(z.object({ period: z.string(), title: z.string(), description: z.string() }))
      .default([]),
  })
  .parse(profileData);
export const site = z
  .object({
    name: z.string().default(''),
    description: z.string().default(''),
    logo: imagePath.default(''),
    favicon: imagePath.default(''),
    defaultAvatar: imagePath.default('/images/avatar/monogram.svg'),
    seoTitle: z.string().default(''),
    ogImage: imagePath.default(''),
    language: z.string().default('zh-CN'),
    theme: z.enum(['system', 'light', 'dark']).default('system'),
    copyright: z.string().default(''),
    knowledgeCategories: z.array(z.string()).default([]),
    resourceCategories: z.array(z.string()).default([]),
  })
  .parse(settings);
export const socials = z
  .array(z.object({ label: z.string().default(''), url: webUrl.default('') }))
  .default([])
  .parse(socialsData)
  .filter((s) => s.url);
export const resources = z
  .array(
    z.object({
      name: z.string().default(''),
      description: z.string().default(''),
      url: webUrl.default(''),
      icon: z.string().default(''),
      category: z.string().default(''),
      recommended: z.boolean().default(false),
      iconImage: imagePath.optional(),
    }),
  )
  .default([])
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
