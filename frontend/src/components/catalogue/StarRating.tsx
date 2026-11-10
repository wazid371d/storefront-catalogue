interface StarRatingProps {
  average: number;
  count: number;
}

export function StarRating({ average, count }: StarRatingProps) {
  const filled = Math.round(average);

  return (
    <span className="star-rating" role="img" aria-label={`Rated ${average.toFixed(1)} out of 5 from ${count} reviews`}>
      <span className="star-rating__stars" aria-hidden="true">
        {Array.from({ length: 5 }).map((_, index) => (
          <span key={index} className={index < filled ? 'star star--filled' : 'star'}>
            ★
          </span>
        ))}
      </span>
      <span className="star-rating__meta" aria-hidden="true">
        {average.toFixed(1)} ({count})
      </span>
    </span>
  );
}
