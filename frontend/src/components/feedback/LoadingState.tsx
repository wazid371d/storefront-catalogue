export function LoadingState({ label = 'Loading…' }: { label?: string }) {
  return (
    <p className="state-banner" role="status">
      {label}
    </p>
  );
}
