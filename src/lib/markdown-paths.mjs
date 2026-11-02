// Root-relative CMS media and internal Markdown links also work on project Pages.
export function withBase(path, base = '/') {
  if (!path || !path.startsWith('/') || path.startsWith('//')) return path;
  const prefix = `/${base.split('/').filter(Boolean).join('/')}`;
  return prefix === '/' || path === prefix || path.startsWith(`${prefix}/`)
    ? path
    : `${prefix}${path}`;
}
export function visit({ base = '/' } = {}) {
  return (tree) => {
    function walk(node) {
      if (['image', 'link', 'definition'].includes(node.type) && node.url) {
        node.url = withBase(node.url, base);
      }
      node.children?.forEach(walk);
    }
    walk(tree);
  };
}
