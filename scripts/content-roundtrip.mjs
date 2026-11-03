// Exercise the public content pipeline locally. This is NOT a Pages CMS login test.
import assert from 'node:assert/strict';
import { readFile, writeFile, unlink, access, readdir } from 'node:fs/promises';
import { resolve } from 'node:path';
import { randomUUID } from 'node:crypto';
import { spawnSync } from 'node:child_process';

const prefix = `acceptance-${randomUUID().slice(0, 8)}`;
const created = [];
const profilePath = resolve('data/profile.json');
const original = await readFile(profilePath, 'utf8');
const profile = JSON.parse(original);
let modifiedProfile;
function build(base = '/', site = 'https://example.com') {
  const result = spawnSync(process.execPath, ['node_modules/astro/bin/astro.mjs', 'build'], {
    cwd: process.cwd(),
    env: { ...process.env, SITE_URL: site, BASE_PATH: base },
    encoding: 'utf8',
  });
  if (result.status !== 0) throw new Error(`Build failed:\n${result.stdout}\n${result.stderr}`);
}
async function create(path, body) {
  await writeFile(path, body, { flag: 'wx' });
  created.push(path);
}
const read = (path) => readFile(resolve('dist', path), 'utf8');
function markdown(title, status = 'published', date = '2026-01-01', extra = '', body = '') {
  return `---\ntitle: "${title}"\ndescription: "Local acceptance fixture"\ndate: ${date}\nstatus: ${status}\ncategory: "验收分类"\ntags: ["acceptance"]\n${extra}\n---\n\n## Test heading\n\n${body}\n`;
}
let changedFile = '';
try {
  const avatar = `public/images/avatar/${prefix}.svg`;
  await create(
    avatar,
    '<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100"><rect width="100" height="100" fill="#667058"/></svg>',
  );
  profile.bio = `${prefix} bio updated`;
  profile.email = 'owner@example.org';
  profile.github = 'https://github.com/example';
  profile.avatar = `/images/avatar/${prefix}.svg`;
  modifiedProfile = JSON.stringify(profile, null, 2);
  await writeFile(profilePath, modifiedProfile);
  for (let i = 0; i < 7; i++) {
    const path = `src/content/blog/${prefix}-${i}.md`;
    await create(
      path,
      markdown(
        `${prefix} post ${i}`,
        'published',
        '2026-01-01',
        `cover: "/images/avatar/${prefix}.svg"`,
        `[About](/about/)\n\n![Fixture](/images/avatar/${prefix}.svg)`,
      ),
    );
  }
  for (const status of ['draft', 'unlisted', 'future']) {
    await create(
      `src/content/blog/${prefix}-${status}.md`,
      markdown(
        'do-not-publish-private-content',
        status === 'future' ? 'published' : status,
        status === 'future' ? '2099-01-01' : '2026-01-01',
      ),
    );
  }
  await create(
    `src/content/knowledge/${prefix}.md`,
    markdown(`${prefix} knowledge`, 'published', '2026-01-01', 'maturity: Growing'),
  );
  await create(
    `src/content/projects/${prefix}.md`,
    markdown(
      `${prefix} project`,
      'published',
      '2026-01-01',
      `projectStatus: "In Progress"\nstack: [Astro, TypeScript]\norder: 0\nfeatured: true\nscreenshots: ["/images/avatar/${prefix}.svg"]\ngithub: "https://github.com/example/project"\ndemo: "https://example.org/demo"`,
    ),
  );
  build('/portfolio/', 'https://owner.github.io');
  assert.ok((await read('index.html')).includes(profile.bio));
  assert.ok((await read('about/index.html')).includes(`/portfolio/images/avatar/${prefix}.svg`));
  const contact = await read('contact/index.html');
  assert.ok(contact.includes('mailto:owner@example.org'));
  assert.ok(contact.includes('https://github.com/example'));
  const post = await read(`blog/${prefix}-0/index.html`);
  assert.ok(post.includes('href="/portfolio/about/"'));
  assert.ok(post.includes(`src="/portfolio/images/avatar/${prefix}.svg"`));
  assert.ok(post.includes('https://owner.github.io/portfolio/blog/'));
  const note = await read(`knowledge/${prefix}/index.html`);
  assert.ok(note.includes('验收分类'));
  const project = await read(`projects/${prefix}/index.html`);
  for (const text of [
    'In Progress',
    'TypeScript',
    'https://github.com/example/project',
    'https://example.org/demo',
    `/portfolio/images/avatar/${prefix}.svg`,
  ])
    assert.ok(project.includes(text), text);
  for (const status of ['draft', 'unlisted', 'future']) {
    await assert.rejects(access(resolve('dist', 'blog', `${prefix}-${status}`, 'index.html')));
  }
  for (const path of ['index.html', 'blog/index.html', 'rss.xml', 'sitemap-0.xml']) {
    const text = await read(path);
    assert.ok(!text.includes('do-not-publish-private-content'), path);
    assert.ok(!text.includes(`${prefix}-draft`), path);
    assert.ok(!text.includes(`${prefix}-future`), path);
  }
  const allHtml = [];
  async function scan(dir) {
    for (const entry of await readdir(dir, { withFileTypes: true })) {
      const path = resolve(dir, entry.name);
      if (entry.isDirectory()) await scan(path);
      else if (entry.name.endsWith('.html')) allHtml.push(await readFile(path, 'utf8'));
    }
  }
  await scan(resolve('dist'));
  for (const html of allHtml) {
    for (const [, path] of html.matchAll(/(?:href|src)="(\/[^"]*)"/g)) {
      if (path.startsWith('//')) continue;
      assert.ok(path.startsWith('/portfolio/'), `Unprefixed internal path ${path}`);
      const local = decodeURIComponent(path.replace('/portfolio/', '').split(/[?#]/)[0]);
      const target = local.endsWith('/') || local === '' ? `${local}index.html` : local;
      await access(resolve('dist', target));
    }
  }
  changedFile = `src/content/blog/${prefix}-0.md`;
  await writeFile(changedFile, markdown(`${prefix} edited title`));
  build('/portfolio/', 'https://owner.github.io');
  assert.ok((await read(`blog/${prefix}-0/index.html`)).includes(`${prefix} edited title`));
  await unlink(changedFile);
  created.splice(created.indexOf(changedFile), 1);
  changedFile = '';
  build('/portfolio/', 'https://owner.github.io');
  await assert.rejects(access(resolve('dist', 'blog', `${prefix}-0`, 'index.html')));
  assert.ok(!(await read('rss.xml')).includes(`${prefix}-0`));
  console.log(
    'Local content round-trip passed: profile/avatar/email/GitHub, create/edit/delete posts, image paths, notes/categories, projects/screenshots, draft/future/unlisted isolation, RSS/sitemap and project-base internal links.',
  );
} finally {
  // Restore only this script's exact fixture writes; never recursively remove data.
  for (const path of created) await unlink(path).catch(() => {});
  const current = await readFile(profilePath, 'utf8');
  if (current === modifiedProfile) await writeFile(profilePath, original);
  else if (current !== original)
    console.warn('Profile changed concurrently; leaving the newer owner edit intact.');
  build();
}
