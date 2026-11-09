import { startInMemoryMongo, stopInMemoryMongo, clearCollections } from '../setup/mongo-memory';
import { ProductCacheRepository } from '../../repositories/product-cache.repository';
import { FeaturedRepository } from '../../repositories/featured.repository';
import { FeaturedProductModel } from '../../models/featured-product.model';
import { ProductService } from '../../services/product.service';
import { FakeProductProvider, buildProduct } from '../fakes/fake-product-provider';

describe('ProductService', () => {
  beforeAll(async () => {
    await startInMemoryMongo();
  });
  afterAll(async () => {
    await stopInMemoryMongo();
  });
  afterEach(async () => {
    await clearCollections();
  });

  const mensClothing = { slug: 'mens-clothing', name: "Men's Clothing" };
  const jewelery = { slug: 'jewelery', name: 'Jewelery' };

  function buildService(provider?: FakeProductProvider, ttlSeconds = 900) {
    const resolvedProvider =
      provider ??
      new FakeProductProvider([
        buildProduct({ id: '1', title: 'Mens Cotton Jacket', category: mensClothing, rating: { average: 4.7, count: 500 } }),
        buildProduct({ id: '2', title: 'Mens Casual T-Shirt', category: mensClothing, rating: { average: 4.1, count: 259 } }),
        buildProduct({ id: '3', title: 'Fjallraven Backpack', category: mensClothing, rating: { average: 3.9, count: 120 } }),
        buildProduct({ id: '4', title: "John Hardy Women's Bracelet", category: jewelery, rating: { average: 4.6, count: 400 } }),
      ]);
    return new ProductService(resolvedProvider, new ProductCacheRepository(), new FeaturedRepository(), ttlSeconds);
  }

  it('returns exactly the curated products for the home page, in curated order', async () => {
    await FeaturedProductModel.create([
      { category: null, productId: '4', position: 1 },
      { category: null, productId: '1', position: 2 },
    ]);

    const featured = await buildService().getFeatured();

    expect(featured.map((p) => p.id)).toEqual(['4', '1']);
  });

  it('falls back to top-rated-by-category when a category has no curated picks', async () => {
    const page = await buildService().getCategoryPage('mens-clothing', 1, 20);
    expect(page.featured.map((p) => p.id)).toEqual(['1', '2', '3']);
  });

  it('excludes curated picks from the "additional products" list for a category', async () => {
    await FeaturedProductModel.create({ category: 'mens-clothing', productId: '1', position: 1 });

    const page = await buildService().getCategoryPage('mens-clothing', 1, 20);

    expect(page.featured.map((p) => p.id)).toEqual(['1']);
    expect(page.items.map((p) => p.id)).not.toContain('1');
    expect(page.items.map((p) => p.id).sort()).toEqual(['2', '3']);
  });

  it('search only returns products whose title matches the term', async () => {
    const result = await buildService().list({ q: 'backpack' });
    expect(result.items.map((p) => p.id)).toEqual(['3']);
  });

  it('matches on a substring of the title, not just a whole word', async () => {
    // "jack" is a substring of "Jacket", not a separate word — proves this is
    // "include" matching, not the old whole-word/stemmed text-index search.
    const result = await buildService().list({ q: 'jack' });
    expect(result.items.map((p) => p.id)).toEqual(['1']);
  });

  it('matches on category name', async () => {
    const result = await buildService().list({ q: 'jewelery' });
    expect(result.items.map((p) => p.id)).toEqual(['4']);
  });

  it('matches on a substring of the price', async () => {
    const provider = new FakeProductProvider([
      buildProduct({ id: '10', title: 'Desk Lamp', category: { slug: 'electronics', name: 'Electronics' }, price: 45.5 }),
      buildProduct({ id: '11', title: 'Floor Lamp', category: { slug: 'electronics', name: 'Electronics' }, price: 120 }),
    ]);
    const result = await buildService(provider).list({ q: '45.5' });
    expect(result.items.map((p) => p.id)).toEqual(['10']);
  });

  it('matches on a substring of the rating', async () => {
    const result = await buildService().list({ q: '4.7' });
    expect(result.items.map((p) => p.id)).toEqual(['1']);
  });

  it('serves the stale cache instead of failing when the upstream provider errors but a cache already exists', async () => {
    await buildService().list({}); // warms the cache

    const failing = buildService(new FakeProductProvider([], new Error('upstream down')), -1); // ttl -1 => always stale
    const result = await failing.list({});

    expect(result.items.length).toBeGreaterThan(0);
  });

  it('throws a 503 when the cache is empty and the upstream provider fails', async () => {
    const failing = buildService(new FakeProductProvider([], new Error('upstream down')));
    await expect(failing.list({})).rejects.toMatchObject({ status: 503 });
  });

  it('throws a 404 for an unknown product id', async () => {
    await expect(buildService().getById('does-not-exist')).rejects.toMatchObject({ status: 404 });
  });
});
