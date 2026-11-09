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
      <div className="section-heading">
        <div>
          <h1>Fieldstone Goods Co.</h1>
          <p>Hand-picked favourites from across the catalogue.</p>
        </div>
      </div>

      {state.status === 'loading' && (
        <section className="section">
          <div className="section-heading">
            <h2>Top Rated</h2>
          </div>
          <ProductGridSkeleton count={5} />
        </section>
      )}
      {state.status === 'error' && <ErrorState message={state.error} onRetry={reload} />}
      {state.status === 'success' && <FeaturedCollection title="Top Rated" products={state.data} />}
    </>
  );
}
