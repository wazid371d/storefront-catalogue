import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { CategoryNav } from '../components/catalogue/CategoryNav';
import * as productsApi from '../api/products';

describe('CategoryNav', () => {
  it('marks the current category with aria-current, not just a visual class', async () => {
    vi.spyOn(productsApi, 'fetchCategories').mockResolvedValue({
      items: [
        { slug: 'electronics', name: 'Electronics' },
        { slug: 'jewelery', name: 'Jewelery' },
      ],
    });

    render(
      <MemoryRouter initialEntries={['/category/jewelery']}>
        <CategoryNav />
      </MemoryRouter>,
    );

    const current = await screen.findByRole('link', { name: 'Jewelery' });
    expect(current).toHaveAttribute('aria-current', 'page');

    const other = screen.getByRole('link', { name: 'Electronics' });
    expect(other).not.toHaveAttribute('aria-current');
  });
});
