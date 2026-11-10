interface ProductGridSkeletonProps {
  count?: number;
  variant?: 'default' | 'featured';
}

export function ProductGridSkeleton({ count = 8, variant = 'default' }: ProductGridSkeletonProps) {
  return (
    <div
      className={variant === 'featured' ? 'product-grid product-grid--featured' : 'product-grid'}
      role="status"
      aria-label="Loading products"
    >
      {Array.from({ length: count }).map((_, index) => (
        <div className="product-card-skeleton" key={index}>
          <div className="skeleton-block" />
          <div className="skeleton-line" style={{ width: '50%' }} />
          <div className="skeleton-line skeleton-line--title" style={{ width: '85%' }} />
          <div className="skeleton-line" style={{ width: '35%' }} />
        </div>
      ))}
    </div>
  );
}
