import type { Product } from '../../api/types';
import { ProductCard } from './ProductCard';
import { EmptyState } from '../feedback/EmptyState';

interface ProductGridProps {
  products: Product[];
  emptyMessage?: string;
}

export function ProductGrid({ products, emptyMessage = 'No products to show.' }: ProductGridProps) {
  if (products.length === 0) return <EmptyState message={emptyMessage} />;

  return (
    <div className="product-grid">
      {products.map((product) => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  );
}
