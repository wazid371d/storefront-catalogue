import { useSearchParams } from 'react-router-dom';
import { useAsync } from '../hooks/useAsync';
import { searchProducts } from '../api/products';
import { ProductGrid } from '../components/catalogue/ProductGrid';
import { LoadingState } from '../components/feedback/LoadingState';
import { ErrorState } from '../components/feedback/ErrorState';

export function SearchResultsPage() {
  const [searchParams] = useSearchParams();
  const query = searchParams.get('q') ?? '';
  const state = useAsync(() => searchProducts(query), [query]);

  return (
    <section className="section">
      <div className="section-heading">
        <h1>Results for &ldquo;{query}&rdquo;</h1>
      </div>
      {state.status === 'loading' && <LoadingState label="Searching…" />}
      {state.status === 'error' && <ErrorState message={state.error} />}
      {state.status === 'success' && (
        <ProductGrid products={state.data.items} emptyMessage={`No products match "${query}".`} />
      )}
    </section>
  );
}
