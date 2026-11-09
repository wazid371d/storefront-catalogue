interface LogoProps {
  size?: number;
}

/** The Fieldstone mark — a cut stone, matching the favicon. Reused wherever the brand appears. */
export function Logo({ size = 28 }: LogoProps) {
  return (
    <svg className="logo-mark" width={size} height={size} viewBox="0 0 32 32" role="img" aria-label="Fieldstone logo">
      <path d="M16 3l11 9-5 17H10L5 12z" fill="currentColor" />
      <path d="M16 3l11 9-5 17h-6z" fill="currentColor" opacity="0.6" />
    </svg>
  );
}
