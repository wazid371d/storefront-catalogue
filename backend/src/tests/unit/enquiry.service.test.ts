import { startInMemoryMongo, stopInMemoryMongo, clearCollections } from '../setup/mongo-memory';
import { EnquiryRepository } from '../../repositories/enquiry.repository';
import { EnquiryModel } from '../../models/enquiry.model';
import { EnquiryService } from '../../services/enquiry.service';
import { ProductService } from '../../services/product.service';
import { ProductCacheRepository } from '../../repositories/product-cache.repository';
import { FeaturedRepository } from '../../repositories/featured.repository';
import { FakeProductProvider, buildProduct } from '../fakes/fake-product-provider';
import { FakeEmailProvider } from '../fakes/fake-email-provider';
import type { EmailProvider } from '../../providers/email/email-provider';

describe('EnquiryService', () => {
  beforeAll(async () => {
    await startInMemoryMongo();
  });
  afterAll(async () => {
    await stopInMemoryMongo();
  });
  afterEach(async () => {
    await clearCollections();
  });

  function buildProductService() {
    const provider = new FakeProductProvider([buildProduct({ id: '1', title: 'Mens Cotton Jacket' })]);
    return new ProductService(provider, new ProductCacheRepository(), new FeaturedRepository(), 900);
  }

  const validInput = {
    productId: '1',
    name: 'Ada Lovelace',
    email: 'ada@example.com',
    message: 'Is this jacket available in a large?',
  };

  it('persists the enquiry and resolves before the email send settles', async () => {
    let releaseSend: (() => void) | undefined;
    const slowEmail: EmailProvider = {
      send: () =>
        new Promise((resolve) => {
          releaseSend = () => resolve({ ok: true });
        }),
    };
    const service = new EnquiryService(new EnquiryRepository(), buildProductService(), slowEmail, 'sales@test.local');

    const result = await service.submit(validInput);

    expect(result.status).toBe('received');
    const stored = await EnquiryModel.findById(result.id).lean();
    expect(stored?.status).toBe('received');
    expect(stored?.productTitle).toBe('Mens Cotton Jacket');

    releaseSend?.();
    // let the background notifySalesTeam promise chain finish its Mongo write
    // before the test (and its afterAll mongo disconnect) completes
    await new Promise((resolve) => setTimeout(resolve, 50));
  });

  it('rejects an enquiry for a product that does not exist', async () => {
    const service = new EnquiryService(
      new EnquiryRepository(),
      buildProductService(),
      new FakeEmailProvider(),
      'sales@test.local',
    );

    await expect(service.submit({ ...validInput, productId: 'does-not-exist' })).rejects.toMatchObject({
      status: 404,
    });
  });

  it('marks the enquiry email_sent after a successful background send', async () => {
    const email = new FakeEmailProvider();
    const service = new EnquiryService(new EnquiryRepository(), buildProductService(), email, 'sales@test.local');

    const result = await service.submit(validInput);
    await new Promise((resolve) => setTimeout(resolve, 20));

    const stored = await EnquiryModel.findById(result.id).lean();
    expect(stored?.status).toBe('email_sent');
    expect(email.sent).toHaveLength(1);
    expect(email.sent[0]?.subject).toContain('Mens Cotton Jacket');
  });

  it('retries once and marks email_failed if both attempts fail', async () => {
    const email = new FakeEmailProvider({ shouldFail: true });
    const retryDelayMs = 20;
    const service = new EnquiryService(
      new EnquiryRepository(),
      buildProductService(),
      email,
      'sales@test.local',
      retryDelayMs,
    );

    const result = await service.submit(validInput);
    await new Promise((resolve) => setTimeout(resolve, retryDelayMs + 50));

    const stored = await EnquiryModel.findById(result.id).lean();
    expect(stored?.status).toBe('email_failed');
    expect(email.sent).toHaveLength(2);
  });
});
