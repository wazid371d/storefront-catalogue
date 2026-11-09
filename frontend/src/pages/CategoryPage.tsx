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
      {state.status === 'error' && <ErrorState message={state.error} onRetry={reload} />}
      {state.status === 'success' && (
        <>
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
