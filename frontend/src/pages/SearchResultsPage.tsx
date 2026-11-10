import { useSearchParams } from 'react-router-dom';
import { useAsync } from '../hooks/useAsync';
import { useDocumentTitle } from '../hooks/useDocumentTitle';
import { searchProducts } from '../api/products';
import { ProductGrid } from '../components/catalogue/ProductGrid';
import { ProductGridSkeleton } from '../components/catalogue/ProductGridSkeleton';
import { ErrorState } from '../components/feedback/ErrorState';

export function SearchResultsPage() {
  const [searchParams] = useSearchParams();
  const query = searchParams.get('q') ?? '';
  const [state, reload] = useAsync(() => searchProducts(query), [query]);
  useDocumentTitle(query ? `Search results for "${query}"` : 'Search');

  return (
    <section className="section">
      <div className="section-heading">
        <div>
          <h1>Results for &ldquo;{query}&rdquo;</h1>
          {state.status === 'success' && (
            // polite + atomic: announces the new count when a search on this same page
            // (not a route change) completes, without needing focus to move anywhere.
            <p role="status" aria-live="polite" aria-atomic="true">
              {state.data.total} {state.data.total === 1 ? 'product' : 'products'} found
            </p>
          )}
        </div>
      </div>
      {state.status === 'loading' && <ProductGridSkeleton />}
      {state.status === 'error' && <ErrorState message={state.error} onRetry={reload} />}
      {state.status === 'success' && (
        <ProductGrid products={state.data.items} emptyMessage={`No products match "${query}".`} />
      )}
    </section>
  );
}
