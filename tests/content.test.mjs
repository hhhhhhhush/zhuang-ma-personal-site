import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { parseDocument } from 'yaml';

test('all sample articles and notes are explicitly public only as examples', async () => {
  for (const dir of ['blog', 'knowledge']) {
    const { readdir } = await import('node:fs/promises');
    for (const name of await readdir(`src/content/${dir}`)) {
      const text = await readFile(`src/content/${dir}/${name}`, 'utf8');
      const doc = parseDocument(text.split('---')[1]);
      assert.equal(doc.get('status'), 'published', name);
      assert.ok(
        String(doc.get('tags')).includes('示例内容'),
        `${name} should be visibly labeled as sample content`,
      );
      assert.ok(doc.get('title'));
      assert.ok(doc.get('description'));
    }
  }
});

test('Pages CMS configuration parses and covers expected managed collections', async () => {
  const doc = parseDocument(await readFile('.pages.yml', 'utf8'));
  assert.equal(doc.errors.length, 0, doc.errors.map((e) => e.message).join('\n'));
  const names = doc.get('content', true).items.map((item) => item.get('name'));
  for (const name of [
    'profile',
    'posts',
    'knowledge',
    'projects',
    'resources',
    'site',
    'socials',
    'navigation',
  ]) {
    assert.ok(names.includes(name), `missing CMS collection ${name}`);
  }
  assert.equal(doc.get('media', true).items.length, 1);
});
