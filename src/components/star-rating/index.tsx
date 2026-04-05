"use client";

import { Star } from "lucide-react";

interface StarRatingProps {
  rate: number;
  setRate: (rate: number) => void;
  maxRating?: number;
  size?: number;
  disabled?: boolean;
}

/**
 * Star Rating Component
 * A reusable component for rating from 0 to 5 (or custom max)
 * @param rate - Current rating value
 * @param setRate - Function to update the rating
 * @param maxRating - Maximum rating value (default: 5)
 * @param size - Size of the stars in pixels (default: 24)
 * @param disabled - Whether the rating is disabled (default: false)
 */
export function StarRating({
  rate,
  setRate,
  maxRating = 5,
  size = 24,
  disabled = false
}: StarRatingProps) {
  return (
    <div className="flex gap-2">
      {Array.from({ length: maxRating }, (_, i) => i).map((index) => (
        <button
          key={index}
          onClick={() => !disabled && setRate(index + 1)}
          onMouseEnter={() => !disabled && setRate(index + 1)}
          disabled={disabled}
          className="transition-transform duration-200 hover:scale-110 disabled:cursor-not-allowed"
          aria-label={`Rate ${index + 1} out of ${maxRating}`}>
          <Star
            size={size}
            className={`transition-colors duration-200 ${
              index < rate ? "fill-primary text-primary" : "text-muted-foreground"
            }`}
          />
        </button>
      ))}
    </div>
  );
}
