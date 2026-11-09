export interface ProductCategory {
  slug: string;
  name: string;
}

export interface ProductRating {
  average: number;
  count: number;
}

/**
 * The shape every layer above the provider boundary works with. Never the
 * upstream provider's raw response shape — see providers/product/product-provider.ts.
 */
export interface Product {
  id: string;
  title: string;
  description: string;
  price: number;
  currency: 'USD';
  category: ProductCategory;
  images: string[];
  rating: ProductRating | null;
  source: string;
}

export interface Page<T> {
  items: T[];
  page: number;
  limit: number;
  total: number;
}

export interface ListProductsParams {
  q?: string;
  category?: string;
  page?: number;
  limit?: number;
  /** ids to leave out of the results — used to keep curated picks from repeating in "additional products" */
  excludeIds?: string[];
}
