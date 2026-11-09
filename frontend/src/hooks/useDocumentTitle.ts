import { useEffect } from 'react';

/** Pass `undefined` to leave the title untouched (e.g. while a title-bearing fetch is still loading). */
export function useDocumentTitle(title: string | undefined): void {
  useEffect(() => {
    if (title) document.title = `${title} — Fieldstone`;
  }, [title]);
}
