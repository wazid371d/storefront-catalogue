import type { Product } from '../../api/types';
import { ProductGrid } from './ProductGrid';

interface FeaturedCollectionProps {
  title: string;
  subtitle?: string;
  products: Product[];
  /** Use "h1" when this section is the page's own top-level heading (the home page). */
  titleTag?: 'h1' | 'h2';
  variant?: 'default' | 'featured';
}

export function FeaturedCollection({
  title,
  subtitle,
  products,
  titleTag: TitleTag = 'h2',
  variant = 'default',
}: FeaturedCollectionProps) {
  return (
    <section className="section">
      <div className="section-heading">
        <div>
          <TitleTag>{title}</TitleTag>
          {subtitle && <p>{subtitle}</p>}
        </div>
      </div>
      <ProductGrid products={products} emptyMessage="Nothing curated here yet." variant={variant} />
    </section>
  );
}
