"use client";

interface RatingDisplayProps {
  rating?: number;
  count?: number;
  userRating?: number;
  size?: "small" | "large";
}

export default function RatingDisplay({
  rating,
  count = 0,
  userRating,
  size = "large",
}: RatingDisplayProps) {
  const sizeClass = size === "small" ? "text-sm" : "text-lg";

  return (
    <div className={`flex flex-col gap-2 ${sizeClass}`}>
      {/* Average rating */}
      {rating ? (
        <div className="flex items-center gap-2">
          <span className="flex items-center gap-1">
            {Array.from({ length: 5 }, (_, i) =>
              i < Math.floor(rating) ? "⭐" : "☆"
            ).join("")}
          </span>
          <span className="font-semibold">{rating}/5</span>
          <span className="text-xs opacity-70">({count} {count === 1 ? "rating" : "ratings"})</span>
        </div>
      ) : (
        <span className="text-gray-400">No ratings yet</span>
      )}

      {/* User's personal rating */}
      {userRating && (
        <div className="flex items-center gap-2 text-sm border-t pt-2">
          <span className="text-xs font-semibold text-gray-600">Your rating:</span>
          <span className="flex items-center gap-1">
            {Array.from({ length: 5 }, (_, i) =>
              i < userRating ? "⭐" : "☆"
            ).join("")}
          </span>
          <span className="font-semibold">{userRating}/5</span>
        </div>
      )}
    </div>
  );
}
