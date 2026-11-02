import { readdir, readFile, stat } from 'node:fs/promises';
import { resolve, sep } from 'node:path';

const root = resolve('dist');
const required = [
  'index.html',
  'about/index.html',
  'blog/index.html',
  'knowledge/index.html',
  'projects/index.html',
  'links/index.html',
  'contact/index.html',
  '404.html',
  'rss.xml',
  'robots.txt',
  'sitemap-index.xml',
];
for (const rel of required) {
  const path = resolve(root, rel);
  if (!path.startsWith(`${root}${sep}`) || !(await stat(path).catch(() => null)))
    throw new Error(`Missing built output: ${rel}`);
}
for (const path of [
  'index.html',
  'blog/index.html',
  'knowledge/index.html',
  'projects/index.html',
]) {
  const html = await readFile(resolve(root, path), 'utf8');
  if (!/<title>.+<\/title>/i.test(html)) throw new Error(`Missing title: ${path}`);
  if (!/name="description"/.test(html)) throw new Error(`Missing description: ${path}`);
  if (!/rel="canonical"/.test(html)) throw new Error(`Missing canonical: ${path}`);
}
const xml = await readFile(resolve(root, 'rss.xml'), 'utf8');
if (!xml.includes('<rss') || !xml.includes('<item>'))
  throw new Error('RSS feed missing public posts');
const htmlPages = [];
async function walk(dir) {
  for (const entry of await readdir(dir, { withFileTypes: true })) {
    const path = resolve(dir, entry.name);
    if (entry.isDirectory()) await walk(path);
    else if (entry.name.endsWith('.html')) htmlPages.push(path);
  }
}
await walk(root);
const all = await Promise.all(htmlPages.map((p) => readFile(p, 'utf8')));
if (all.some((html) => html.includes('do-not-publish-private-content')))
  throw new Error('Private-content sentinel leaked into built pages');
console.log(
  `Built-site smoke checks passed (${required.length} required outputs, ${htmlPages.length} HTML pages).`,
);
