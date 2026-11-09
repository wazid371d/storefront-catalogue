import { Link } from 'react-router-dom';
import type { Product } from '../../api/types';

export function ProductCard({ product }: { product: Product }) {
  return (
    <Link to={`/products/${product.id}`} className="product-card">
      <div className="product-card__image">
        <img src={product.images[0]} alt={product.title} loading="lazy" />
      </div>
      <div className="product-card__body">
        <span className="product-card__category">{product.category.name}</span>
        <h3 className="product-card__title">{product.title}</h3>
        <div className="product-card__footer">
          <span className="product-card__price">${product.price.toFixed(2)}</span>
          {product.rating && (
            <span className="product-card__rating">
              ★ {product.rating.average.toFixed(1)} ({product.rating.count})
            </span>
          )}
        </div>
      </div>
    </Link>
  );
}
