/** "mens-clothing" -> "Mens Clothing" — a readable fallback label while a category's real name is loading. */
export function humanizeSlug(slug: string): string {
  return slug
    .split('-')
    .filter(Boolean)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}
