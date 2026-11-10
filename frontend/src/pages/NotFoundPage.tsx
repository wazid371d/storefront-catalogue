import { Link } from 'react-router-dom';
import { useDocumentTitle } from '../hooks/useDocumentTitle';

export function NotFoundPage() {
  useDocumentTitle('Page not found');

  return (
    <div className="not-found">
      <svg className="not-found__mark" viewBox="0 0 64 64" width="56" height="56" aria-hidden="true">
        <circle cx="32" cy="32" r="30" fill="none" stroke="currentColor" strokeWidth="2" />
        <path d="M22 26l20 12M42 26L22 38" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      </svg>
      <h1>Page not found</h1>
      <p>We couldn&rsquo;t find the page you&rsquo;re looking for — it may have moved.</p>
      <Link to="/" className="button">
        Back to the catalogue
      </Link>
    </div>
  );
}
