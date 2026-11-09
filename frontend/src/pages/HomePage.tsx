import { useAsync } from '../hooks/useAsync';
import { fetchFeaturedProducts } from '../api/products';
import { FeaturedCollection } from '../components/catalogue/FeaturedCollection';
import { LoadingState } from '../components/feedback/LoadingState';
import { ErrorState } from '../components/feedback/ErrorState';

export function HomePage() {
  const state = useAsync(() => fetchFeaturedProducts().then((res) => res.items), []);

  return (
    <>
      <div className="section-heading">
        <div>
          <h1>Fieldstone Goods Co.</h1>
          <p>Hand-picked favourites from across the catalogue.</p>
        </div>
      </div>

      {state.status === 'loading' && <LoadingState label="Loading featured products…" />}
      {state.status === 'error' && <ErrorState message={state.error} />}
      {state.status === 'success' && <FeaturedCollection title="Top Rated" products={state.data} />}
    </>
  );
}
