import { test, expect } from '@playwright/test';
import { writeFile, unlink } from 'node:fs/promises';
import { randomUUID } from 'node:crypto';
import { spawnSync } from 'node:child_process';

function rebuild() {
  const result = spawnSync(process.execPath, ['node_modules/astro/bin/astro.mjs', 'build'], {
    env: { ...process.env, SITE_URL: 'https://example.com', BASE_PATH: '/' },
    encoding: 'utf8',
  });
  if (result.status !== 0) throw new Error(`${result.stdout}\n${result.stderr}`);
}

test('main pages, local links and assets have no errors', async ({ page }) => {
  const errors: string[] = [];
  page.on('pageerror', (error) => errors.push(error.message));
  for (const path of [
    '/',
    '/about/',
    '/blog/',
    '/knowledge/',
    '/projects/',
    '/links/',
    '/contact/',
    '/admin/',
    '/blog/hello-world/',
    '/knowledge/ai-literacy/',
    '/projects/personal-garden/',
  ]) {
    const response = await page.goto(path);
    expect(response?.status(), path).toBe(200);
    await expect(page.locator('main h1')).toBeVisible();
    expect(await page.locator('title').textContent()).not.toBe('');
    await expect(page.locator('link[rel="canonical"]')).toHaveAttribute(
      'href',
      /https:\/\/example.com/,
    );
    const brokenImages = await page
      .locator('img')
      .evaluateAll(
        (images) =>
          images.filter(
            (image) =>
              image instanceof HTMLImageElement && image.complete && image.naturalWidth === 0,
          ).length,
      );
    expect(brokenImages, path).toBe(0);
  }
  expect(errors).toEqual([]);
});

test('search, categories, tags, URL state and empty results work', async ({ page }) => {
  await page.goto('/blog/');
  await page.getByRole('searchbox').fill('写作');
  await expect(page.locator('[data-entry]:visible')).toHaveCount(2);
  await page.getByRole('button', { name: '学习笔记' }).click();
  await expect(page.locator('[data-entry]:visible')).toHaveCount(1);
  await expect(page).toHaveURL(/category=/);
  await page.locator('select[name="tag"]').selectOption('学习方法');
  await expect(page.locator('[data-entry]:visible')).toHaveCount(1);
  await page.reload();
  await expect(page.getByRole('searchbox')).toHaveValue('写作');
  await expect(page.locator('[data-entry]:visible')).toHaveCount(1);
  await page.getByRole('searchbox').fill('nothing-matches-this-string');
  await expect(page.locator('.empty-state')).toBeVisible();
  await expect(page.locator('[data-entry]:visible')).toHaveCount(0);
  await page.goto('/knowledge/?q=模型');
  await expect(page.locator('[data-entry]:visible')).toHaveCount(1);
});

test('theme persists and mobile menu supports keyboard dismissal', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/');
  await page.locator('.theme-toggle').click();
  const theme = await page.locator('html').getAttribute('data-theme');
  await page.reload();
  await expect(page.locator('html')).toHaveAttribute('data-theme', theme!);
  const button = page.locator('.menu-toggle');
  await button.click();
  await expect(page.locator('#navigation')).toBeVisible();
  await expect(button).toHaveAttribute('aria-expanded', 'true');
  await page.keyboard.press('Escape');
  await expect(button).toHaveAttribute('aria-expanded', 'false');
  await button.click();
  await page.getByRole('link', { name: 'Blog', exact: true }).click();
  await expect(page).toHaveURL(/\/blog\/$/);
});

test('article outline, reading progress and RSS are real', async ({ page, request }) => {
  await page.goto('/blog/writing-as-thinking/');
  await page.locator('.toc a').first().click();
  await expect(page).toHaveURL(/#/);
  await page.locator('.article-pagination').scrollIntoViewIfNeeded();
  const transform = await page
    .locator('.reading-progress')
    .evaluate((el) => getComputedStyle(el).transform);
  expect(transform).not.toBe('matrix(0, 0, 0, 1, 0, 0)');
  await expect(page.locator('.prose table')).toBeVisible();
  const feed = await request.get('/rss.xml');
  expect(feed.status()).toBe(200);
  expect(await feed.text()).toContain('<item>');
});

test('responsive pages do not horizontally overflow and screenshots are saved', async ({
  page,
}) => {
  for (const width of [375, 768, 1440]) {
    await page.setViewportSize({ width, height: 1000 });
    for (const path of [
      '/',
      '/about/',
      '/blog/',
      '/knowledge/',
      '/projects/',
      '/links/',
      '/contact/',
      '/blog/writing-as-thinking/',
    ]) {
      await page.goto(path);
      expect(
        await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1),
        `${path} at ${width}px`,
      ).toBe(true);
    }
  }
  await page.goto('/');
  await page.screenshot({
    path: 'test-results/home-desktop.png',
    fullPage: true,
    animations: 'disabled',
  });
  await page.setViewportSize({ width: 390, height: 844 });
  await page.screenshot({
    path: 'test-results/home-mobile.png',
    fullPage: true,
    animations: 'disabled',
  });
  await page.locator('.theme-toggle').click();
  await page.screenshot({
    path: 'test-results/home-dark.png',
    fullPage: true,
    animations: 'disabled',
  });
});

test('pagination changes real results and resets when filtering', async ({ page }) => {
  const id = `pagination-${randomUUID().slice(0, 8)}`;
  const paths: string[] = [];
  try {
    for (let i = 0; i < 7; i++) {
      const path = `src/content/blog/${id}-${i}.md`;
      await writeFile(
        path,
        `---\ntitle: "${id} ${i}"\ndescription: "Pagination fixture"\ndate: 2026-01-01\nstatus: published\ncategory: BrowserTest\ntags: [pagination]\n---\n\nTest content.\n`,
        { flag: 'wx' },
      );
      paths.push(path);
    }
    rebuild();
    await expect(async () => {
      await page.goto('/blog/');
      await expect(page.locator('.search-count')).toContainText('10 篇');
    }).toPass({ timeout: 15000 });
    await expect(page.locator('[data-entry]:visible')).toHaveCount(6);
    await page.locator('[data-next]').click();
    await expect(page.locator('[data-entry]:visible')).toHaveCount(4);
    await expect(page.locator('[data-page]')).toHaveText('2 / 2');
    await expect(page.locator('[data-next]')).toBeDisabled();
    await page.getByRole('searchbox').fill(id);
    await expect(page.locator('[data-page]')).toHaveText('1 / 2');
    await page.locator('[data-next]').click();
    await expect(page.locator('[data-entry]:visible')).toHaveCount(1);
  } finally {
    for (const path of paths) await unlink(path);
    rebuild();
  }
});
