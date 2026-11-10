import type { Product } from '../../types/catalogue';

/**
 * Everything above this line (services, controllers) depends only on this
 * shape. FakeStoreProvider is the one implementation today; a future PIM or
 * proprietary catalogue becomes a second implementation, not a rewrite.
 */
export interface ProductProvider {
  /** Full current catalogue, normalised. The upstream dataset is small enough to fetch whole. */
  fetchAll(): Promise<Product[]>;
}
