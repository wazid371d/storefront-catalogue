import { useState } from 'react';

interface ProductThumbnailProps {
  src: string | undefined;
  alt: string;
}

/** Falls back to a lettered placeholder if the product image is missing or fails to load. */
export function ProductThumbnail({ src, alt }: ProductThumbnailProps) {
  const [failed, setFailed] = useState(false);

  if (!src || failed) {
    return (
      <div className="image-fallback" role="img" aria-label={alt}>
        <span aria-hidden="true">{alt.trim().charAt(0).toUpperCase() || '?'}</span>
      </div>
    );
  }

  return <img src={src} alt={alt} loading="lazy" onError={() => setFailed(true)} />;
}
