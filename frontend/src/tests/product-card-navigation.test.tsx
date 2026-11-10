import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { ProductCard } from '../components/catalogue/ProductCard';
import type { Product } from '../api/types';

const product: Product = {
  id: '42',
  title: 'Mens Cotton Jacket',
  description: 'A warm cotton jacket.',
  price: 55.99,
  currency: 'USD',
  category: { slug: 'mens-clothing', name: "Men's Clothing" },
  images: ['https://example.com/jacket.jpg'],
  rating: { average: 4.7, count: 500 },
  source: 'fakestore',
};

describe('ProductCard', () => {
  it('navigates to the product detail page when the tile is clicked', async () => {
    const user = userEvent.setup();

    render(
      <MemoryRouter initialEntries={['/']}>
        <Routes>
          <Route path="/" element={<ProductCard product={product} />} />
          <Route path="/products/:id" element={<div>Product detail page</div>} />
        </Routes>
      </MemoryRouter>,
    );

    await user.click(screen.getByRole('link', { name: /mens cotton jacket/i }));

    expect(await screen.findByText('Product detail page')).toBeInTheDocument();
  });
});
