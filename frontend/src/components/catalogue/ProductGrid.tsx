import type { Product } from '../../api/types';
import { ProductCard } from './ProductCard';
import { EmptyState } from '../feedback/EmptyState';

interface ProductGridProps {
  products: Product[];
  emptyMessage?: string;
  /** "featured" locks the grid to a fixed, even column count instead of auto-fill — used where the
   *  set size is fixed by design (the home page's 5 curated picks) so a row never ends with a lone
   *  trailing card. */
  variant?: 'default' | 'featured';
}

export function ProductGrid({ products, emptyMessage = 'No products to show.', variant = 'default' }: ProductGridProps) {
  if (products.length === 0) return <EmptyState message={emptyMessage} />;

  return (
    <div className={variant === 'featured' ? 'product-grid product-grid--featured' : 'product-grid'}>
      {products.map((product) => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  );
}
