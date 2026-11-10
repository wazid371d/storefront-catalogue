import { FormEvent, useEffect, useState } from 'react';
import { useLocation, useNavigate, useSearchParams } from 'react-router-dom';

export function SearchBar() {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const [term, setTerm] = useState(searchParams.get('q') ?? '');

  // Clearing the box while viewing results is "I'm done searching" — take the
  // customer back to browsing immediately, not just on the next submit.
  useEffect(() => {
    if (location.pathname === '/search' && term.trim() === '') {
      navigate('/');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [term, location.pathname]);

  function handleSubmit(event: FormEvent) {
    event.preventDefault();
    const trimmed = term.trim();
    if (!trimmed) {
      navigate('/');
      return;
    }
    navigate(`/search?q=${encodeURIComponent(trimmed)}`);
  }

  return (
    <form className="search-bar" role="search" onSubmit={handleSubmit}>
      <input
        className="search-bar__input"
        type="search"
        placeholder="Search products…"
        value={term}
        onChange={(event) => setTerm(event.target.value)}
        aria-label="Search products"
      />
      <button type="submit" className="search-bar__button">
        Search
      </button>
    </form>
  );
}
