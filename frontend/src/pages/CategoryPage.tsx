import { useParams } from 'react-router-dom';
import { useAsync } from '../hooks/useAsync';
import { useDocumentTitle } from '../hooks/useDocumentTitle';
import { fetchCategoryProducts } from '../api/products';
import { FeaturedCollection } from '../components/catalogue/FeaturedCollection';
import { ProductGrid } from '../components/catalogue/ProductGrid';
import { ProductGridSkeleton } from '../components/catalogue/ProductGridSkeleton';
import { ErrorState } from '../components/feedback/ErrorState';
import { Breadcrumbs } from '../components/layout/Breadcrumbs';
import { humanizeSlug } from '../utils/humanizeSlug';

export function CategoryPage() {
  const { slug = '' } = useParams();
  const [state, reload] = useAsync(() => fetchCategoryProducts(slug), [slug]);
  const categoryLabel = humanizeSlug(slug);
  useDocumentTitle(categoryLabel);

  return (
    <>
      <Breadcrumbs items={[{ label: 'Home', to: '/' }, { label: categoryLabel }]} />

      {state.status === 'loading' && (
        <section className="section">
          <div className="section-heading">
            <h1>{categoryLabel}</h1>
          </div>
          <ProductGridSkeleton />
        </section>
      )}
      {state.status === 'error' && (
        <>
          {/* The visible heading above only renders while loading — this keeps every
              state anchored to exactly one <h1> matching the page's actual subject,
              without changing what's visibly on screen. */}
          <h1 className="sr-only">{categoryLabel}</h1>
          <ErrorState message={state.error} onRetry={reload} />
        </>
      )}
      {state.status === 'success' && (
        <>
          <h1 className="sr-only">{categoryLabel}</h1>
          <FeaturedCollection title="Top Rated" subtitle={`Our picks in ${categoryLabel}`} products={state.data.featured} />
          <section className="section">
            <div className="section-heading">
              <h2>More in {categoryLabel}</h2>
            </div>
            <ProductGrid products={state.data.items} emptyMessage="No additional products in this category yet." />
          </section>
        </>
      )}
    </>
  );
}
