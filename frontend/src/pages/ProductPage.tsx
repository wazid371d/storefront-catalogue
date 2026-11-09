import { useParams } from 'react-router-dom';
import { useState } from 'react';
import { useAsync } from '../hooks/useAsync';
import { fetchProduct } from '../api/products';
import { LoadingState } from '../components/feedback/LoadingState';
import { ErrorState } from '../components/feedback/ErrorState';
import { EnquiryDialog } from '../components/enquiry/EnquiryDialog';

export function ProductPage() {
  const { id = '' } = useParams();
  const state = useAsync(() => fetchProduct(id), [id]);
  const [isEnquiryOpen, setEnquiryOpen] = useState(false);

  if (state.status === 'loading') return <LoadingState label="Loading product…" />;
  if (state.status === 'error') return <ErrorState message={state.error} />;

  const product = state.data;

  return (
    <div className="product-detail">
      <div className="product-detail__image">
        <img src={product.images[0]} alt={product.title} />
      </div>
      <div>
        <span className="product-detail__category">{product.category.name}</span>
        <h1 className="product-detail__title">{product.title}</h1>
        <p className="product-detail__price">${product.price.toFixed(2)}</p>
        {product.rating && (
          <p className="product-detail__rating">
            ★ {product.rating.average.toFixed(1)} ({product.rating.count} ratings)
          </p>
        )}
        <p className="product-detail__description">{product.description}</p>
        <button type="button" className="button" onClick={() => setEnquiryOpen(true)}>
          Enquire
        </button>
      </div>

      <EnquiryDialog
        isOpen={isEnquiryOpen}
        onClose={() => setEnquiryOpen(false)}
        productId={product.id}
        productTitle={product.title}
      />
    </div>
  );
}
