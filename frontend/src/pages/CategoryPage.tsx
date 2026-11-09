import { useParams } from 'react-router-dom';
import { useAsync } from '../hooks/useAsync';
import { fetchCategoryProducts } from '../api/products';
import { FeaturedCollection } from '../components/catalogue/FeaturedCollection';
import { ProductGrid } from '../components/catalogue/ProductGrid';
import { LoadingState } from '../components/feedback/LoadingState';
import { ErrorState } from '../components/feedback/ErrorState';

export function CategoryPage() {
  const { slug = '' } = useParams();
  const state = useAsync(() => fetchCategoryProducts(slug), [slug]);

  if (state.status === 'loading') return <LoadingState label="Loading category…" />;
  if (state.status === 'error') return <ErrorState message={state.error} />;

  const { featured, items } = state.data;

  return (
    <>
      <FeaturedCollection title="Top Rated" subtitle="Our picks in this category" products={featured} />
      <section className="section">
        <div className="section-heading">
          <h2>More in this category</h2>
        </div>
        <ProductGrid products={items} emptyMessage="No additional products in this category yet." />
      </section>
    </>
  );
}
