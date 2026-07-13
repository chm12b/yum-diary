import { Star } from "lucide-react";

type RecordStarRatingProps = {
  rating: number;
};

export default function RecordStarRating({ rating }: RecordStarRatingProps) {
  const filledStarCount = Math.round(rating);

  return (
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
  );
}
