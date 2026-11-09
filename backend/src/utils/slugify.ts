/** "men's clothing" -> "mens-clothing" */
export function slugify(label: string): string {
  return label
    .toLowerCase()
    .trim()
    .replace(/'/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}
