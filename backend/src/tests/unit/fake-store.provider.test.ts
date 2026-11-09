import { FakeStoreProvider } from '../../providers/product/fake-store.provider';
import { startTestServer } from '../setup/test-http-server';

describe('FakeStoreProvider', () => {
  it('normalises raw Fake Store products into the internal Product shape', async () => {
    const server = await startTestServer((_req, res) => {
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(
        JSON.stringify([
          {
            id: 1,
            title: 'Jacket',
            price: 55.99,
            description: 'Warm',
            category: "men's clothing",
            image: 'https://img/1.jpg',
            rating: { rate: 4.7, count: 500 },
          },
        ]),
      );
    });

    try {
      const products = await new FakeStoreProvider(server.url).fetchAll();
      expect(products).toEqual([
        {
          id: '1',
          title: 'Jacket',
          description: 'Warm',
          price: 55.99,
          currency: 'USD',
          category: { slug: 'mens-clothing', name: "Men's Clothing" },
          images: ['https://img/1.jpg'],
          rating: { average: 4.7, count: 500 },
          source: 'fakestore',
        },
      ]);
    } finally {
      await server.close();
    }
  });

  it('drops malformed entries instead of failing the whole fetch', async () => {
    const server = await startTestServer((_req, res) => {
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(
        JSON.stringify([
          {
            id: 1,
            title: 'Jacket',
            price: 55.99,
            description: 'Warm',
            category: "men's clothing",
            image: 'https://img/1.jpg',
          },
          { id: 'not-a-number', title: 'Broken' },
        ]),
      );
    });

    try {
      const products = await new FakeStoreProvider(server.url).fetchAll();
      expect(products).toHaveLength(1);
      expect(products[0]?.id).toBe('1');
    } finally {
      await server.close();
    }
  });

  it('opens the circuit after repeated upstream failures', async () => {
    const server = await startTestServer((_req, res) => {
      res.writeHead(500);
      res.end();
    });

    try {
      // FakeStoreProvider opens its breaker after 3 consecutive failures
      const provider = new FakeStoreProvider(server.url);
      await expect(provider.fetchAll()).rejects.toThrow('responded with 500');
      await expect(provider.fetchAll()).rejects.toThrow('responded with 500');
      await expect(provider.fetchAll()).rejects.toThrow('responded with 500');
      // the breaker is now open — this call must short-circuit instead of hitting the server again
      await expect(provider.fetchAll()).rejects.toThrow('circuit open');
    } finally {
      await server.close();
    }
  });
});
