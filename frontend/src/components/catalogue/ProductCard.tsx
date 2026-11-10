import { Link } from 'react-router-dom';
import type { Product } from '../../api/types';
import { formatPrice } from '../../utils/formatPrice';
import { StarRating } from './StarRating';
import { ProductThumbnail } from './ProductThumbnail';

export function ProductCard({ product }: { product: Product }) {
  return (
    <Link to={`/products/${product.id}`} className="product-card">
      <div className="product-card__image">
        <ProductThumbnail src={product.images[0]} alt={product.title} />
      </div>
      <div className="product-card__body">
        <span className="product-card__category">{product.category.name}</span>
        <h3 className="product-card__title">{product.title}</h3>
        <div className="product-card__footer">
          <span className="product-card__price">{formatPrice(product.price, product.currency)}</span>
          {product.rating && <StarRating average={product.rating.average} count={product.rating.count} />}
        </div>
      </div>
    </Link>
  );
}
