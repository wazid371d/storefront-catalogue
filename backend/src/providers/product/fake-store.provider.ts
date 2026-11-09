import { z } from 'zod';
import type { ProductProvider } from './product-provider';
import type { Product } from '../../types/catalogue';
import { CircuitBreaker } from '../../utils/circuit-breaker';
import { slugify } from '../../utils/slugify';
import { titleCase } from '../../utils/text';
import { logger } from '../../utils/logger';

const rawProductSchema = z.object({
  id: z.number(),
  title: z.string(),
  price: z.number(),
  description: z.string(),
  category: z.string(),
  image: z.string(),
  rating: z.object({ rate: z.number(), count: z.number() }).optional(),
});

function normalize(raw: z.infer<typeof rawProductSchema>): Product {
  return {
    id: String(raw.id),
    title: raw.title,
    description: raw.description,
    price: raw.price,
    currency: 'USD',
    category: { slug: slugify(raw.category), name: titleCase(raw.category) },
    images: [raw.image],
    rating: raw.rating ? { average: raw.rating.rate, count: raw.rating.count } : null,
    source: 'fakestore',
  };
}

export class FakeStoreProvider implements ProductProvider {
  private readonly breaker = new CircuitBreaker({ failureThreshold: 3, cooldownMs: 60_000 });

  constructor(private readonly baseUrl: string) {}

  async fetchAll(): Promise<Product[]> {
    return this.breaker.execute(async () => {
      const response = await fetch(`${this.baseUrl}/products`);
      if (!response.ok) {
        throw new Error(`Fake Store API responded with ${response.status}`);
      }

      const raw: unknown = await response.json();
      if (!Array.isArray(raw)) {
        throw new Error('Fake Store API returned an unexpected shape');
      }

      const products: Product[] = [];
      for (const item of raw) {
        const parsed = rawProductSchema.safeParse(item);
        if (!parsed.success) {
          logger.warn('Dropping malformed product from Fake Store API', {
            issues: parsed.error.issues.map((i) => i.message),
          });
          continue;
        }
        products.push(normalize(parsed.data));
      }
      return products;
    });
  }
}
