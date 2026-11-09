import { ProductCacheModel, ProductCacheDocument } from '../models/product-cache.model';
import type { Product, ProductCategory, ListProductsParams, Page } from '../types/catalogue';

function toProduct(doc: ProductCacheDocument): Product {
  return {
    id: doc.providerId,
    title: doc.title,
    description: doc.description,
    price: doc.price,
    currency: 'USD',
    category: { slug: doc.category.slug, name: doc.category.name },
    images: doc.images,
    rating: doc.rating ? { average: doc.rating.average, count: doc.rating.count } : null,
    source: doc.source,
  };
}

export class ProductCacheRepository {
  /** Stale if empty, or if the oldest cached entry is older than ttlSeconds. */
  async isStale(ttlSeconds: number): Promise<boolean> {
    const oldest = await ProductCacheModel.findOne().sort({ cachedAt: 1 }).lean();
    if (!oldest) return true;
    const ageSeconds = (Date.now() - new Date(oldest.cachedAt).getTime()) / 1000;
    return ageSeconds > ttlSeconds;
  }

  async hasAny(): Promise<boolean> {
    const count = await ProductCacheModel.estimatedDocumentCount();
    return count > 0;
  }

  async replaceAll(products: Product[]): Promise<void> {
    const now = new Date();
    const operations = products.map((product) => ({
      updateOne: {
        filter: { providerId: product.id },
        update: {
          $set: {
            providerId: product.id,
            title: product.title,
            description: product.description,
            price: product.price,
            currency: product.currency,
            category: product.category,
            images: product.images,
            rating: product.rating,
            source: product.source,
            cachedAt: now,
          },
        },
        upsert: true,
      },
    }));

    if (operations.length === 0) return;

    await ProductCacheModel.bulkWrite(operations);
    // drop anything no longer present upstream
    await ProductCacheModel.deleteMany({
      providerId: { $nin: products.map((p) => p.id) },
    });
  }

  async query(params: ListProductsParams): Promise<Page<Product>> {
    const page = params.page ?? 1;
    const limit = params.limit ?? 20;

    const filter: Record<string, unknown> = {};
    if (params.category) filter['category.slug'] = params.category;
    if (params.q) filter.$text = { $search: params.q };
    if (params.excludeIds && params.excludeIds.length > 0) {
      filter.providerId = { $nin: params.excludeIds };
    }

    const [docs, total] = await Promise.all([
      ProductCacheModel.find(filter)
        .sort(params.q ? { score: { $meta: 'textScore' } } : { title: 1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .lean(),
      ProductCacheModel.countDocuments(filter),
    ]);

    return { items: docs.map((d) => toProduct(d as unknown as ProductCacheDocument)), page, limit, total };
  }

  async findById(providerId: string): Promise<Product | null> {
    const doc = await ProductCacheModel.findOne({ providerId }).lean();
    return doc ? toProduct(doc as unknown as ProductCacheDocument) : null;
  }

  /** Preserves the order of `ids` — callers rely on this for curated ordering. */
  async findByIds(ids: string[]): Promise<Product[]> {
    if (ids.length === 0) return [];
    const docs = await ProductCacheModel.find({ providerId: { $in: ids } }).lean();
    const byId = new Map(docs.map((d) => [d.providerId, toProduct(d as unknown as ProductCacheDocument)]));
    return ids.map((id) => byId.get(id)).filter((p): p is Product => Boolean(p));
  }

  async listCategories(): Promise<ProductCategory[]> {
    const docs = await ProductCacheModel.aggregate<ProductCategory>([
      { $group: { _id: '$category.slug', name: { $first: '$category.name' } } },
      { $project: { _id: 0, slug: '$_id', name: 1 } },
      { $sort: { name: 1 } },
    ]);
    return docs;
  }

  /** Top-N products in a category by upstream rating — the fallback when a category has no curated picks. */
  async topRatedByCategory(categorySlug: string, limit: number): Promise<Product[]> {
    const docs = await ProductCacheModel.find({ 'category.slug': categorySlug })
      .sort({ 'rating.average': -1 })
      .limit(limit)
      .lean();
    return docs.map((d) => toProduct(d as unknown as ProductCacheDocument));
  }
}
