export function ProductDetailSkeleton() {
  return (
    <div className="product-detail" role="status" aria-label="Loading product">
      <div className="product-detail__image">
        <div className="skeleton-block" style={{ width: '100%', height: '100%' }} />
      </div>
      <div className="product-detail-skeleton">
        <div className="skeleton-line" style={{ width: '30%' }} />
        <div className="skeleton-line skeleton-line--title" style={{ width: '75%' }} />
        <div className="skeleton-line" style={{ width: '20%' }} />
        <div className="skeleton-line" style={{ width: '40%' }} />
        <div className="skeleton-line" style={{ width: '100%' }} />
        <div className="skeleton-line" style={{ width: '90%' }} />
        <div className="skeleton-line" style={{ width: '60%' }} />
      </div>
    </div>
  );
}
