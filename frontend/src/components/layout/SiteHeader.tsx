import { Link } from 'react-router-dom';
import { CategoryNav } from '../catalogue/CategoryNav';
import { SearchBar } from '../catalogue/SearchBar';
import { Logo } from './Logo';

export function SiteHeader() {
  return (
    <header className="site-header">
      <div className="site-header__bar">
        <Link to="/" className="site-header__brand">
          <Logo />
          <span>
            Fieldstone
            <small>Goods Co.</small>
          </span>
        </Link>
        <CategoryNav />
        <SearchBar />
      </div>
    </header>
  );
}
