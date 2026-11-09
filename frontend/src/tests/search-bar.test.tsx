import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Routes, Route, useLocation } from 'react-router-dom';
import { SearchBar } from '../components/catalogue/SearchBar';

function LocationProbe() {
  const location = useLocation();
  return <div data-testid="location">{location.pathname + location.search}</div>;
}

function renderApp(initialEntry: string) {
  return render(
    <MemoryRouter initialEntries={[initialEntry]}>
      <SearchBar />
      <Routes>
        <Route path="/" element={<div data-testid="home">Home</div>} />
        <Route path="/search" element={<LocationProbe />} />
      </Routes>
    </MemoryRouter>,
  );
}

describe('SearchBar', () => {
  it('navigates to the search results page with the entered term when the search button is clicked', async () => {
    const user = userEvent.setup();
    renderApp('/');

    await user.type(screen.getByRole('searchbox', { name: /search products/i }), 'jacket');
    await user.click(screen.getByRole('button', { name: /search/i }));

    expect(await screen.findByTestId('location')).toHaveTextContent('/search?q=jacket');
  });

  it('returns to the home page as soon as the search term is cleared, with no extra click needed', async () => {
    const user = userEvent.setup();
    renderApp('/search?q=jacket');

    await user.clear(screen.getByRole('searchbox', { name: /search products/i }));

    expect(await screen.findByTestId('home')).toBeInTheDocument();
  });

  it('does not redirect away while the box is simply empty on a non-search page', () => {
    renderApp('/');

    expect(screen.getByTestId('home')).toBeInTheDocument();
  });
});
