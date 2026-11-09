import type { ProductProvider } from '../providers/product/product-provider';
import { ProductCacheRepository } from '../repositories/product-cache.repository';
import { FeaturedRepository } from '../repositories/featured.repository';
import type { Product, ProductCategory, ListProductsParams, Page } from '../types/catalogue';
import { HttpError } from '../utils/http-error';
import { logger } from '../utils/logger';

const CATEGORY_FALLBACK_FEATURED_COUNT = 3;

export interface CategoryPage {
  featured: Product[];
  items: Product[];
  page: number;
  limit: number;
  total: number;
}

/**
 * Owns the home / category / search rules. Talks to the catalogue only
 * through ProductProvider and ProductCacheRepository — never anything
 * upstream-specific directly.
 */
export class ProductService {
  constructor(
    private readonly provider: ProductProvider,
    private readonly cache: ProductCacheRepository,
    private readonly featured: FeaturedRepository,
    private readonly cacheTtlSeconds: number,
  ) {}

  /**
   * Cache-aside: refreshes from the provider only when stale. On upstream
   * failure, serves what's already cached rather than failing the request —
   * a 503 is reserved for the case where there has never been a cache to fall
   * back on (see SYSTEM_DESIGN.md §09).
   */
  async ensureFreshCatalogue(): Promise<void> {
    const stale = await this.cache.isStale(this.cacheTtlSeconds);
    if (!stale) return;

    try {
      const products = await this.provider.fetchAll();
      await this.cache.replaceAll(products);
    } catch (err) {
      const hasAny = await this.cache.hasAny();
      if (!hasAny) {
        throw HttpError.serviceUnavailable('Catalogue temporarily unavailable — please try again shortly.');
      }
      logger.warn('Serving stale product cache after upstream failure', { error: String(err) });
    }
  }

  async list(params: ListProductsParams): Promise<Page<Product>> {
    await this.ensureFreshCatalogue();
    return this.cache.query(params);
  }

  async getFeatured(): Promise<Product[]> {
    await this.ensureFreshCatalogue();
    const ids = await this.featured.getCuratedProductIds(null);
    return this.cache.findByIds(ids);
  }

  async getById(id: string): Promise<Product> {
    await this.ensureFreshCatalogue();
    const product = await this.cache.findById(id);
    if (!product) throw HttpError.notFound(`Product ${id} was not found`);
    return product;
  }

  async listCategories(): Promise<ProductCategory[]> {
    await this.ensureFreshCatalogue();
    return this.cache.listCategories();
  }

  async getCategoryPage(slug: string, page: number, limit: number): Promise<CategoryPage> {
    await this.ensureFreshCatalogue();

    const curatedIds = await this.featured.getCuratedProductIds(slug);
    const featured = curatedIds.length > 0
      ? await this.cache.findByIds(curatedIds)
      : await this.cache.topRatedByCategory(slug, CATEGORY_FALLBACK_FEATURED_COUNT);

    const rest = await this.cache.query({
      category: slug,
      page,
      limit,
      excludeIds: featured.map((p) => p.id),
    });

    return { featured, items: rest.items, page: rest.page, limit: rest.limit, total: rest.total };
  }
}
