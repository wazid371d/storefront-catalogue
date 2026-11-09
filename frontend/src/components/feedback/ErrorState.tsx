export function ErrorState({ message }: { message: string }) {
  return (
    <p className="state-banner state-banner--error" role="alert">
      {message}
    </p>
  );
}
