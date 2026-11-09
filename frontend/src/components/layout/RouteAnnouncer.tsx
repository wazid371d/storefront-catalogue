import { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';

/**
 * A full page load tells assistive tech what the new page is automatically;
 * an SPA route change does not. This announces the document title whenever
 * it changes after a navigation — watched via MutationObserver rather than
 * read once, because pages set their title asynchronously (ProductPage only
 * knows it once the fetch resolves) and a one-shot read would race that.
 */
export function RouteAnnouncer() {
  const { pathname } = useLocation();
  const [announcement, setAnnouncement] = useState('');

  useEffect(() => {
    const titleEl = document.querySelector('title');
    if (!titleEl) return;

    const announce = () => setAnnouncement(document.title);
    announce();

    const observer = new MutationObserver(announce);
    observer.observe(titleEl, { childList: true });
    return () => observer.disconnect();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname]);

  return (
    <div className="sr-only" role="status" aria-live="polite" aria-atomic="true">
      {announcement}
    </div>
  );
}
