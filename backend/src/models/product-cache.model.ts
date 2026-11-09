import { Schema, model, Document } from 'mongoose';
import type { Product } from '../types/catalogue';

export interface ProductCacheDocument extends Document, Omit<Product, 'id'> {
  providerId: string;
  cachedAt: Date;
}

const productCacheSchema = new Schema<ProductCacheDocument>({
  providerId: { type: String, required: true, unique: true },
  title: { type: String, required: true },
  description: { type: String, required: true },
  price: { type: Number, required: true },
  currency: { type: String, required: true, default: 'USD' },
  category: {
    slug: { type: String, required: true },
    name: { type: String, required: true },
  },
  images: { type: [String], default: [] },
  rating: {
    type: new Schema({ average: Number, count: Number }, { _id: false }),
    default: null,
  },
  source: { type: String, required: true },
  cachedAt: { type: Date, required: true, default: Date.now },
});

// No text index: search is substring matching across title, category name,
// price, and rating, done in application code — see product-cache.repository.ts.
productCacheSchema.index({ 'category.slug': 1 });
// TTL: Mongo drops documents once cachedAt is this old. Refresh logic in the
// repository decides staleness explicitly — this index is the hard backstop.
productCacheSchema.index({ cachedAt: 1 }, { expireAfterSeconds: 60 * 60 * 6 });

export const ProductCacheModel = model<ProductCacheDocument>('ProductCache', productCacheSchema);
