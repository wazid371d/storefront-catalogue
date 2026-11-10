import type { ProductProvider } from '../../providers/product/product-provider';
import type { Product } from '../../types/catalogue';

export class FakeProductProvider implements ProductProvider {
  constructor(
    private readonly products: Product[],
    private readonly error?: Error,
  ) {}

  async fetchAll(): Promise<Product[]> {
    if (this.error) throw this.error;
    return this.products;
  }
}

export function buildProduct(overrides: Partial<Product> = {}): Product {
  return {
    id: '1',
    title: 'Test Product',
    description: 'A product used in tests',
    price: 19.99,
    currency: 'USD',
    category: { slug: 'test-category', name: 'Test Category' },
    images: ['https://example.com/image.jpg'],
    rating: { average: 4.5, count: 10 },
    source: 'fakestore',
    ...overrides,
  };
}
