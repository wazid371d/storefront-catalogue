/** "men's clothing" -> "Men's Clothing" */
export function titleCase(input: string): string {
  return input.replace(/\w\S*/g, (word) => word.charAt(0).toUpperCase() + word.slice(1));
}
