export function filterEntries(entries, { query = '', category = '', tag = '' } = {}) {
  const words = query.normalize('NFKC').toLocaleLowerCase().trim().split(/\s+/).filter(Boolean);
  return entries.filter(
    (entry) =>
      (!category || entry.category === category) &&
      (!tag || entry.tags.includes(tag)) &&
      words.every((word) =>
        `${entry.search} ${entry.tags.join(' ')}`
          .normalize('NFKC')
          .toLocaleLowerCase()
          .includes(word),
      ),
  );
}
export function paginate(items, requested = 1, size = 6) {
  const pages = Math.max(1, Math.ceil(items.length / size));
  const page = Math.min(pages, Math.max(1, Number.isFinite(requested) ? Math.floor(requested) : 1));
  return { page, pages, items: items.slice((page - 1) * size, page * size) };
}
