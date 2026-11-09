import { NavLink } from 'react-router-dom';
import { useAsync } from '../../hooks/useAsync';
import { fetchCategories } from '../../api/products';

export function CategoryNav() {
  const [state] = useAsync(() => fetchCategories().then((r) => r.items), []);

  if (state.status !== 'success') return null;

  return (
    <nav className="category-nav" aria-label="Categories">
      {state.data.map((category) => (
        <NavLink
          key={category.slug}
          to={`/category/${category.slug}`}
          className={({ isActive }) => `category-nav__link${isActive ? ' is-active' : ''}`}
        >
          {category.name}
        </NavLink>
      ))}
    </nav>
  );
}
