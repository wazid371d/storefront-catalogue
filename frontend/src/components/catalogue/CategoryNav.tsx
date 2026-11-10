import { NavLink, useLocation } from 'react-router-dom';
import { useAsync } from '../../hooks/useAsync';
import { fetchCategories } from '../../api/products';

export function CategoryNav() {
  const [state] = useAsync(() => fetchCategories().then((r) => r.items), []);
  const location = useLocation();

  if (state.status !== 'success') return null;

  return (
    <nav className="category-nav" aria-label="Categories">
      {state.data.map((category) => {
        const isActive = location.pathname === `/category/${category.slug}`;
        return (
          <NavLink
            key={category.slug}
            to={`/category/${category.slug}`}
            className={({ isActive }) => `category-nav__link${isActive ? ' is-active' : ''}`}
            aria-current={isActive ? 'page' : undefined}
          >
            {category.name}
          </NavLink>
        );
      })}
    </nav>
  );
}
