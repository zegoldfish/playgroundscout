/**
 * Converts latitude/longitude to OSM tile coordinates
 * Uses the Slippy Map tile math (Web Mercator projection)
 */
function latLonToTile(
  lat: number,
  lon: number,
  zoom: number
): { x: number; y: number } {
  const n = Math.pow(2, zoom);
  
  const x = Math.floor(((lon + 180) / 360) * n);
  
  const latRad = (lat * Math.PI) / 180;
  const y = Math.floor(
    ((1 - Math.log(Math.tan(latRad) + 1 / Math.cos(latRad)) / Math.PI) / 2) * n
  );
  
  return { x, y };
}

/**
 * Generates an OSM tile URL for the given coordinates
 * @param lat - Latitude
 * @param lon - Longitude
 * @param zoom - Zoom level (default 15 for playground-level detail)
 * @returns OSM tile image URL
 */
export function getTileUrl(lat: number, lon: number, zoom: number = 15): string {
  const { x, y } = latLonToTile(lat, lon, zoom);
  return `https://tile.openstreetmap.org/${zoom}/${x}/${y}.png`;
}
