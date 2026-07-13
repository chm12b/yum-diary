"use client";

import { Star } from "lucide-react";

type StarPickerProps = {
  rating: number;
  onChange: (rating: number) => void;
};

export default function StarPicker({ rating, onChange }: StarPickerProps) {
  return (
    <div className="flex items-center gap-0.5">
      {Array.from({ length: 5 }, (_, index) => {
        const starValue = index + 1;
        const isFilled = starValue <= rating;

        return (
          <button
            key={index}
            type="button"
            aria-label={`${starValue} 顆星`}
            onClick={() => onChange(starValue)}
            className="p-0.5 transition-transform active:scale-95"
          >
            <Star
              className={`h-5 w-5 ${
                isFilled ? "fill-amber-400 text-amber-400" : "text-cocoa/25"
              }`}
              strokeWidth={2}
            />
          </button>
        );
      })}
    </div>
  );
}
