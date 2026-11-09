import { useAsync } from '../hooks/useAsync';
import { useDocumentTitle } from '../hooks/useDocumentTitle';
import { fetchFeaturedProducts } from '../api/products';
import { FeaturedCollection } from '../components/catalogue/FeaturedCollection';
import { ProductGridSkeleton } from '../components/catalogue/ProductGridSkeleton';
import { ErrorState } from '../components/feedback/ErrorState';

export function HomePage() {
  const [state, reload] = useAsync(() => fetchFeaturedProducts().then((res) => res.items), []);
  useDocumentTitle('Home');

  return (
    <>
      {state.status === 'loading' && (
        <section className="section">
          <div className="section-heading">
            <h1>Top 5 rated products</h1>
          </div>
          <ProductGridSkeleton count={5} variant="featured" />
        </section>
      )}
      {state.status === 'error' && <ErrorState message={state.error} onRetry={reload} />}
      {state.status === 'success' && (
        <FeaturedCollection title="Top 5 rated products" products={state.data} titleTag="h1" variant="featured" />
      )}
    </>
  );
}
