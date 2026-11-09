import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Routes, Route, useLocation } from 'react-router-dom';
import { SearchBar } from '../components/catalogue/SearchBar';

function LocationProbe() {
  const location = useLocation();
  return <div data-testid="location">{location.pathname + location.search}</div>;
}

function renderSearchBar() {
  return render(
    <MemoryRouter initialEntries={['/']}>
      <Routes>
        <Route path="/" element={<SearchBar />} />
        <Route path="/search" element={<LocationProbe />} />
      </Routes>
    </MemoryRouter>,
  );
}

describe('SearchBar', () => {
  it('navigates to the search results page with the entered term when the search button is clicked', async () => {
    const user = userEvent.setup();
    renderSearchBar();

    await user.type(screen.getByRole('searchbox', { name: /search products/i }), 'jacket');
    await user.click(screen.getByRole('button', { name: /search/i }));

    expect(await screen.findByTestId('location')).toHaveTextContent('/search?q=jacket');
  });

  it('does nothing when the search term is empty', async () => {
    const user = userEvent.setup();
    renderSearchBar();

    await user.click(screen.getByRole('button', { name: /search/i }));

    expect(screen.queryByTestId('location')).not.toBeInTheDocument();
  });
});
