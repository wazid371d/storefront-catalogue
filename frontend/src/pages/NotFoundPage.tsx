import { Link } from 'react-router-dom';

export function NotFoundPage() {
  return (
    <div className="state-banner">
      <p>We couldn&rsquo;t find that page.</p>
      <p>
        <Link to="/">Back to the catalogue</Link>
      </p>
    </div>
  );
}
