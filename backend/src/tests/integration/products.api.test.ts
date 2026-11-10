import request from 'supertest';
import { startInMemoryMongo, stopInMemoryMongo, clearCollections } from '../setup/mongo-memory';
import { createApp } from '../../app';
import { ProductService } from '../../services/product.service';
import { EnquiryService } from '../../services/enquiry.service';
import { ProductCacheRepository } from '../../repositories/product-cache.repository';
import { FeaturedRepository } from '../../repositories/featured.repository';
import { EnquiryRepository } from '../../repositories/enquiry.repository';
import { FeaturedProductModel } from '../../models/featured-product.model';
import { FakeProductProvider, buildProduct } from '../fakes/fake-product-provider';
import { FakeEmailProvider } from '../fakes/fake-email-provider';

describe('products & categories API', () => {
  beforeAll(async () => {
    await startInMemoryMongo();
  });
  afterAll(async () => {
    await stopInMemoryMongo();
  });
  afterEach(async () => {
    await clearCollections();
  });

  function buildTestApp() {
    const provider = new FakeProductProvider([
      buildProduct({ id: '1', title: 'Mens Cotton Jacket', category: { slug: 'mens-clothing', name: "Men's Clothing" } }),
      buildProduct({ id: '2', title: 'Silicon Power SSD', category: { slug: 'electronics', name: 'Electronics' } }),
    ]);
    const productService = new ProductService(provider, new ProductCacheRepository(), new FeaturedRepository(), 900);
    const enquiryService = new EnquiryService(
      new EnquiryRepository(),
      productService,
      new FakeEmailProvider(),
      'sales@test.local',
    );
    return createApp({
      productService,
      enquiryService,
      corsOrigin: '*',
      enquiryRateLimit: { windowMs: 60_000, max: 20 },
    });
  }

  it('GET /products/featured returns only the curated products', async () => {
    await FeaturedProductModel.create({ category: null, productId: '2', position: 1 });
    const app = buildTestApp();

    const res = await request(app).get('/api/v1/products/featured');

    expect(res.status).toBe(200);
    expect(res.body.items).toHaveLength(1);
    expect(res.body.items[0].id).toBe('2');
  });

  it('GET /products?q= only returns products matching the search term', async () => {
    const app = buildTestApp();

    const res = await request(app).get('/api/v1/products').query({ q: 'jacket' });

    expect(res.status).toBe(200);
    expect(res.body.items.map((p: { id: string }) => p.id)).toEqual(['1']);
  });

  it('GET /products/:id returns 404 for an unknown product', async () => {
    const app = buildTestApp();
    const res = await request(app).get('/api/v1/products/999');
    expect(res.status).toBe(404);
  });

  it('GET /categories/:slug/products returns curated + additional products for the category', async () => {
    const app = buildTestApp();

    const res = await request(app).get('/api/v1/categories/mens-clothing/products');

    expect(res.status).toBe(200);
    expect(res.body.featured.map((p: { id: string }) => p.id)).toContain('1');
  });
});
