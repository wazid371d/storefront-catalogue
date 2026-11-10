import { FeaturedProductModel } from '../models/featured-product.model';

export class FeaturedRepository {
  /** Ordered product ids curated for the home page (category: null) or a specific category. */
  async getCuratedProductIds(category: string | null): Promise<string[]> {
    const docs = await FeaturedProductModel.find({ category }).sort({ position: 1 }).lean();
    return docs.map((d) => d.productId);
  }
}
