export interface ProductCategory {
  slug: string;
  name: string;
}

export interface ProductRating {
  average: number;
  count: number;
}

export interface Product {
  id: string;
  title: string;
  description: string;
  price: number;
  currency: string;
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

export interface CategoryPage {
  featured: Product[];
  items: Product[];
  page: number;
  limit: number;
  total: number;
}
