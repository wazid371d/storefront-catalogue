interface LogoProps {
  size?: number;
}

/**
 * The Fieldstone mark — a stacked cairn of three stones, matching the favicon.
 * Decorative: every usage sits directly beside the visible "Fieldstone" text,
 * which already supplies the accessible name — an aria-label here would just
 * make that name announce twice.
 */
export function Logo({ size = 28 }: LogoProps) {
  return (
    <svg className="logo-mark" width={size} height={size} viewBox="0 0 32 32" aria-hidden="true">
      <ellipse cx="16" cy="28" rx="10" ry="1.6" fill="currentColor" opacity="0.15" />
      <ellipse cx="16" cy="23.5" rx="11" ry="5" fill="currentColor" />
      <ellipse cx="14.5" cy="16" rx="8" ry="4.2" fill="currentColor" opacity="0.85" />
      <ellipse cx="17" cy="9.5" rx="5.3" ry="3.4" fill="currentColor" opacity="0.7" />
    </svg>
  );
}
