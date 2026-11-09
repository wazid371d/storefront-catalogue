import fs from 'node:fs';
import path from 'node:path';
import { FeaturedProductModel } from '../models/featured-product.model';
import { logger } from '../utils/logger';

interface SeedEntry {
  productId: string;
  category: string | null;
  position: number;
}

/**
 * Idempotent: safe to run on every boot. This is how "5 products chosen as
 * top rated" gets into the system for the PoC — a stand-in for the admin
 * curation screen in SYSTEM_DESIGN.md §13's growth path.
 */
export async function runSeed(): Promise<void> {
  const seedPath = path.join(__dirname, 'featured-products.seed.json');
  const entries: SeedEntry[] = JSON.parse(fs.readFileSync(seedPath, 'utf-8'));

  const operations = entries.map((entry) => ({
    updateOne: {
      filter: { category: entry.category, productId: entry.productId },
      update: { $set: { position: entry.position, curatedAt: new Date() } },
      upsert: true,
    },
  }));

  if (operations.length > 0) {
    await FeaturedProductModel.bulkWrite(operations);
  }
  logger.info(`Seeded ${entries.length} curated product entries`);
}

// `npm run seed` — run standalone against MONGODB_URI without starting the server.
if (require.main === module) {
  void (async () => {
    const dotenv = await import('dotenv');
    dotenv.config();
    const { env } = await import('../config/env');
    const { connectDatabase, disconnectDatabase } = await import('../db/connect');

    await connectDatabase(env.MONGODB_URI);
    await runSeed();
    await disconnectDatabase();
  })().catch((err: unknown) => {
    logger.error('Seed script failed', { error: String(err) });
    process.exit(1);
  });
}
