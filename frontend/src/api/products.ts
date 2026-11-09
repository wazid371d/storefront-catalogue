import { apiClient } from './client';
import type { Product, ProductCategory, Page, CategoryPage } from './types';

export function fetchFeaturedProducts(): Promise<{ items: Product[] }> {
  return apiClient.get('/products/featured');
}

export function searchProducts(query: string): Promise<Page<Product>> {
  return apiClient.get(`/products?q=${encodeURIComponent(query)}`);
}

export function fetchProduct(id: string): Promise<Product> {
  return apiClient.get(`/products/${encodeURIComponent(id)}`);
}

export function fetchCategories(): Promise<{ items: ProductCategory[] }> {
  return apiClient.get('/categories');
}

export function fetchCategoryProducts(slug: string): Promise<CategoryPage> {
  return apiClient.get(`/categories/${encodeURIComponent(slug)}/products`);
}
