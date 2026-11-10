import 'dotenv/config';
import { env } from './config/env';
import { connectDatabase } from './db/connect';
import { createApp } from './app';
import { FakeStoreProvider } from './providers/product/fake-store.provider';
import { SmtpProvider } from './providers/email/smtp.provider';
import { ProductCacheRepository } from './repositories/product-cache.repository';
import { FeaturedRepository } from './repositories/featured.repository';
import { EnquiryRepository } from './repositories/enquiry.repository';
import { ProductService } from './services/product.service';
import { EnquiryService } from './services/enquiry.service';
import { runSeed } from './seed/run-seed';
import { logger } from './utils/logger';

async function main(): Promise<void> {
  await connectDatabase(env.MONGODB_URI);
  await runSeed();

  const productProvider = new FakeStoreProvider(env.FAKE_STORE_API_BASE_URL);
  const emailProvider = new SmtpProvider({ host: env.SMTP_HOST, port: env.SMTP_PORT, from: env.SMTP_FROM });

  const productCacheRepository = new ProductCacheRepository();
  const featuredRepository = new FeaturedRepository();
  const enquiryRepository = new EnquiryRepository();

  const productService = new ProductService(
    productProvider,
    productCacheRepository,
    featuredRepository,
    env.PRODUCT_CACHE_TTL_SECONDS,
  );
  const enquiryService = new EnquiryService(enquiryRepository, productService, emailProvider, env.SALES_INBOX_EMAIL);

  const app = createApp({
    productService,
    enquiryService,
    corsOrigin: env.CORS_ORIGIN,
    enquiryRateLimit: { windowMs: env.RATE_LIMIT_WINDOW_MS, max: env.RATE_LIMIT_MAX },
  });

  app.listen(env.PORT, () => {
    logger.info(`Catalogue API listening on port ${env.PORT}`);
  });
}

main().catch((err) => {
  logger.error('Failed to start server', { error: err instanceof Error ? err.stack : String(err) });
  process.exit(1);
});
