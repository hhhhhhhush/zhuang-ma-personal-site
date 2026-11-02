import test from 'node:test';
import assert from 'node:assert/strict';
import { filterEntries, paginate } from '../src/lib/search.mjs';
import { withBase } from '../src/lib/markdown-paths.mjs';

const entries = [
  { search: 'Astro setup static site', category: 'Development', tags: ['Astro', 'web'] },
  { search: '知识整理 note taking', category: 'Knowledge', tags: ['学习'] },
  { search: 'No match', category: 'Development', tags: [] },
];

test('query searches titles, summaries and tags case-insensitively', () => {
  assert.equal(filterEntries(entries, { query: 'ASTRO' }).length, 1);
  assert.equal(filterEntries(entries, { query: '学习' }).length, 1);
  assert.equal(filterEntries(entries, { query: 'setup site' }).length, 1);
  assert.equal(filterEntries(entries, { query: 'absent' }).length, 0);
});

test('category, tag and normalized whitespace filters combine', () => {
  assert.equal(
    filterEntries(entries, { query: ' ASTRO  ', category: 'Development', tag: 'web' }).length,
    1,
  );
  assert.equal(filterEntries(entries, { category: 'Knowledge', tag: 'web' }).length, 0);
});

test('pagination clamps boundaries and handles empty results', () => {
  assert.deepEqual(paginate(entries, 2, 2), { page: 2, pages: 2, items: [entries[2]] });
  assert.equal(paginate(entries, 90, 2).page, 2);
  assert.equal(paginate([], 1, 6).pages, 1);
});

test('base paths are applied once and external URLs are unchanged', () => {
  assert.equal(withBase('/about/', '/repo'), '/repo/about/');
  assert.equal(withBase('/repo/about/', '/repo'), '/repo/about/');
  assert.equal(withBase('https://example.org/image.png', '/repo'), 'https://example.org/image.png');
});
