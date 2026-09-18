const BACKEND_URL = "http://localhost:3001";

export async function searchLocations(searchValue: string) {
  const response = await fetch(
    `${BACKEND_URL}/api/onemap/search?searchVal=${encodeURIComponent(searchValue)}`
  );

  if (!response.ok) {
    throw new Error("Failed to search OneMap");
  }

  return await response.json();
}


export async function getWalkingRoute(
  startLat: number,
  startLng: number,
  endLat: number,
  endLng: number
) {
  const params = new URLSearchParams({
    startLat: String(startLat),
    startLng: String(startLng),
    endLat: String(endLat),
    endLng: String(endLng),
  });

  const response = await fetch(
    `${BACKEND_URL}/api/onemap/route?${params}`
  );

  if (!response.ok) {
    throw new Error("Failed to find route");
  }

  return await response.json();
}
