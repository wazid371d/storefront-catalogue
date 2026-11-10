import { Schema, model, Document } from 'mongoose';

export interface FeaturedProductDocument extends Document {
  productId: string;
  /** null = home page; a category slug = that category's curated picks */
  category: string | null;
  position: number;
  curatedAt: Date;
}

const featuredProductSchema = new Schema<FeaturedProductDocument>({
  productId: { type: String, required: true },
  category: { type: String, default: null },
  position: { type: Number, required: true },
  curatedAt: { type: Date, required: true, default: Date.now },
});

featuredProductSchema.index({ category: 1, position: 1 });
featuredProductSchema.index({ category: 1, productId: 1 }, { unique: true });

export const FeaturedProductModel = model<FeaturedProductDocument>('FeaturedProduct', featuredProductSchema);
