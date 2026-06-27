import { Star } from "lucide-react";

interface StarRatingProps {
  rating?: number;
  max?: number; // user-defined max
  size?: number; // optional: icon size
}

export default function StarRatingInput({ rating = 0, max = 5, size = 16 }: StarRatingProps) {
  const safeRating = Math.min(Math.max(rating, 0), max);

  return (
    <div className="flex items-center gap-1">
      {Array.from({ length: max }).map((_, index) => (
        <Star
          key={index}
          style={{ width: size, height: size }}
          className={
            index < safeRating ? "fill-yellow-400 text-yellow-400" : "text-muted-foreground"
          }
        />
      ))}
    </div>
  );
}
