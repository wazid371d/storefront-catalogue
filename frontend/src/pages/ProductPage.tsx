import { useParams } from 'react-router-dom';
import { useState } from 'react';
import { useAsync } from '../hooks/useAsync';
import { useDocumentTitle } from '../hooks/useDocumentTitle';
import { fetchProduct } from '../api/products';
import { formatPrice } from '../utils/formatPrice';
import { ErrorState } from '../components/feedback/ErrorState';
import { EnquiryDialog } from '../components/enquiry/EnquiryDialog';
import { Breadcrumbs } from '../components/layout/Breadcrumbs';
import { StarRating } from '../components/catalogue/StarRating';
import { ProductThumbnail } from '../components/catalogue/ProductThumbnail';
import { ProductDetailSkeleton } from '../components/catalogue/ProductDetailSkeleton';

export function ProductPage() {
  const { id = '' } = useParams();
  const [state, reload] = useAsync(() => fetchProduct(id), [id]);
  const [isEnquiryOpen, setEnquiryOpen] = useState(false);
  useDocumentTitle(state.status === 'success' ? state.data.title : undefined);

  if (state.status === 'loading') {
    return (
      <>
        {/* The product's own title becomes the visible <h1> once it loads — this
            keeps every state anchored to exactly one heading in the meantime. */}
        <h1 className="sr-only">Product</h1>
        <ProductDetailSkeleton />
      </>
    );
  }
  if (state.status === 'error') {
    return (
      <>
        <h1 className="sr-only">Product</h1>
        <ErrorState message={state.error} onRetry={reload} />
      </>
    );
  }

  const product = state.data;

  return (
    <>
      <Breadcrumbs
        items={[
          { label: 'Home', to: '/' },
          { label: product.category.name, to: `/category/${product.category.slug}` },
          { label: product.title },
        ]}
      />
      <div className="product-detail">
        <div className="product-detail__image">
          <ProductThumbnail src={product.images[0]} alt={product.title} />
        </div>
        <div>
          <span className="product-detail__category">{product.category.name}</span>
          <h1 className="product-detail__title">{product.title}</h1>
          <p className="product-detail__price">{formatPrice(product.price, product.currency)}</p>
          {product.rating && (
            <p className="product-detail__rating">
              <StarRating average={product.rating.average} count={product.rating.count} />
            </p>
          )}
          <p className="product-detail__description">{product.description}</p>
          <button type="button" className="button" onClick={() => setEnquiryOpen(true)}>
            Enquire
          </button>
        </div>
      </div>

      <EnquiryDialog
        isOpen={isEnquiryOpen}
        onClose={() => setEnquiryOpen(false)}
        productId={product.id}
        productTitle={product.title}
      />
    </>
  );
}
