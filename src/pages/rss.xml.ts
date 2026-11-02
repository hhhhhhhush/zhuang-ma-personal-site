import rss from '@astrojs/rss';
import { posts, site, url } from '../lib/content';
export async function GET(context: { site: URL }) {
  return rss({
    title: site.name,
    description: site.description,
    site: context.site,
    items: (await posts()).map((entry) => ({
      title: entry.data.title,
      description: entry.data.description,
      pubDate: entry.data.date,
      categories: entry.data.tags,
      link: url(`/blog/${entry.id}/`),
    })),
    customData: `<language>${site.language}</language>`,
  });
}
