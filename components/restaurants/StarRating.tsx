import { Star } from "lucide-react";

type StarRatingProps = {
  rating: number;
  reviewCount: number;
};

export default function StarRating({ rating, reviewCount }: StarRatingProps) {
  const filledStarCount = Math.round(rating);

  return (
    <div className="flex items-center gap-1.5">
      <div className="flex items-center">
        {Array.from({ length: 5 }, (_, index) => (
          <Star
            key={index}
            className={`h-3.5 w-3.5 ${
              index < filledStarCount
                ? "fill-amber-400 text-amber-400"
                : "text-cocoa/25"
            }`}
            strokeWidth={2}
          />
        ))}
      </div>
      <span className="text-sm text-cocoa">
        {rating.toFixed(1)} ({reviewCount})
      </span>
    </div>
  );
}
