import type { Product } from '../../api/types';
import { ProductGrid } from './ProductGrid';

interface FeaturedCollectionProps {
  title: string;
  subtitle?: string;
  products: Product[];
}

export function FeaturedCollection({ title, subtitle, products }: FeaturedCollectionProps) {
  return (
    <section className="section">
      <div className="section-heading">
        <div>
          <h2>{title}</h2>
          {subtitle && <p>{subtitle}</p>}
        </div>
      </div>
      <ProductGrid products={products} emptyMessage="Nothing curated here yet." />
    </section>
  );
}
