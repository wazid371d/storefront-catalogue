import request from 'supertest';
import { startInMemoryMongo, stopInMemoryMongo, clearCollections } from '../setup/mongo-memory';
import { createApp } from '../../app';
import { ProductService } from '../../services/product.service';
import { EnquiryService } from '../../services/enquiry.service';
import { ProductCacheRepository } from '../../repositories/product-cache.repository';
import { FeaturedRepository } from '../../repositories/featured.repository';
import { EnquiryRepository } from '../../repositories/enquiry.repository';
import { EnquiryModel } from '../../models/enquiry.model';
import { FakeProductProvider, buildProduct } from '../fakes/fake-product-provider';
import { FakeEmailProvider } from '../fakes/fake-email-provider';
import type { EmailProvider } from '../../providers/email/email-provider';

describe('POST /api/v1/enquiries', () => {
  beforeAll(async () => {
    await startInMemoryMongo();
  });
  afterAll(async () => {
    await stopInMemoryMongo();
  });
  afterEach(async () => {
    await clearCollections();
  });

  function buildTestApp(email: EmailProvider = new FakeEmailProvider()) {
    const provider = new FakeProductProvider([buildProduct({ id: '1', title: 'Mens Cotton Jacket' })]);
    const productService = new ProductService(provider, new ProductCacheRepository(), new FeaturedRepository(), 900);
    // short retry delay so the background email retry doesn't outlive the test
    const enquiryService = new EnquiryService(new EnquiryRepository(), productService, email, 'sales@test.local', 20);
    return createApp({
      productService,
      enquiryService,
      corsOrigin: '*',
      enquiryRateLimit: { windowMs: 60_000, max: 20 },
    });
  }

  const validPayload = {
    productId: '1',
    name: 'Ada Lovelace',
    email: 'ada@example.com',
    message: 'Is this jacket available in a large?',
  };

  it('returns 201 "received" without waiting on the email provider', async () => {
    const slowEmail: EmailProvider = { send: () => new Promise(() => {}) }; // never resolves
    const app = buildTestApp(slowEmail);

    const res = await request(app).post('/api/v1/enquiries').send(validPayload);

    expect(res.status).toBe(201);
    expect(res.body.status).toBe('received');
    expect(res.body.id).toBeTruthy();
  });

  it('persists the enquiry for the sales team even when email delivery fails', async () => {
    const app = buildTestApp(new FakeEmailProvider({ shouldFail: true }));

    const res = await request(app).post('/api/v1/enquiries').send(validPayload);

    expect(res.status).toBe(201);
    const stored = await EnquiryModel.findById(res.body.id).lean();
    expect(stored?.name).toBe('Ada Lovelace');
    expect(stored?.productTitle).toBe('Mens Cotton Jacket');

    // let the background retry (and its eventual status update) finish before
    // the suite's afterAll disconnects Mongo
    await new Promise((resolve) => setTimeout(resolve, 100));
  });

  it('rejects an invalid payload with field-level errors', async () => {
    const app = buildTestApp();

    const res = await request(app)
      .post('/api/v1/enquiries')
      .send({ productId: '1', name: 'A', email: 'not-an-email', message: 'short' });

    expect(res.status).toBe(422);
    expect(res.body.errors).toEqual(
      expect.arrayContaining([expect.objectContaining({ field: 'email' })]),
    );
  });

  it('rejects an enquiry for an unknown product', async () => {
    const app = buildTestApp();

    const res = await request(app)
      .post('/api/v1/enquiries')
      .send({ ...validPayload, productId: 'does-not-exist' });

    expect(res.status).toBe(404);
  });
});
