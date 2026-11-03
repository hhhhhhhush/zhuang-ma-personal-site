export function GET({ site }: { site: URL }) {
  const isExample = site.hostname === 'example.com';
  return new Response(
    `User-agent: *\n${isExample ? 'Disallow: /' : 'Allow: /'}\nSitemap: ${new URL(`${import.meta.env.BASE_URL.replace(/\/$/, '')}/sitemap-index.xml`, site)}\n`,
    { headers: { 'Content-Type': 'text/plain; charset=utf-8' } },
  );
}
