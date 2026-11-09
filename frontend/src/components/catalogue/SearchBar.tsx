import { FormEvent, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';

export function SearchBar() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [term, setTerm] = useState(searchParams.get('q') ?? '');

  function handleSubmit(event: FormEvent) {
    event.preventDefault();
    const trimmed = term.trim();
    if (!trimmed) return;
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
