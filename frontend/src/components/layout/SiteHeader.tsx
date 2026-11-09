import { Link } from 'react-router-dom';
import { CategoryNav } from '../catalogue/CategoryNav';
import { SearchBar } from '../catalogue/SearchBar';

export function SiteHeader() {
  return (
    <header className="site-header">
      <div className="site-header__bar">
        <Link to="/" className="site-header__brand">
          Fieldstone
          <small>Goods Co.</small>
        </Link>
        <CategoryNav />
        <SearchBar />
      </div>
    </header>
  );
}
