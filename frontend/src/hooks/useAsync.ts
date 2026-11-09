import { useEffect, useState } from 'react';

export type AsyncState<T> =
  | { status: 'loading' }
  | { status: 'error'; error: string }
  | { status: 'success'; data: T };

/** Re-runs `fn` whenever `deps` changes; ignores results from a stale run. */
export function useAsync<T>(fn: () => Promise<T>, deps: unknown[]): AsyncState<T> {
  const [state, setState] = useState<AsyncState<T>>({ status: 'loading' });

  useEffect(() => {
    let cancelled = false;
    setState({ status: 'loading' });

    fn()
      .then((data) => {
        if (!cancelled) setState({ status: 'success', data });
      })
      .catch((err: unknown) => {
        if (!cancelled) {
          setState({ status: 'error', error: err instanceof Error ? err.message : 'Something went wrong' });
        }
      });

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);

  return state;
}
