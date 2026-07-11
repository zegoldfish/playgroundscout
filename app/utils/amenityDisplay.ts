/**
 * Converts a lowercase amenity name to title case for display
 * e.g., "basketball hoop" -> "Basketball Hoop"
 */
export function amenityNameToDisplay(name: string): string {
  return name
    .split(" ")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(" ");
}
