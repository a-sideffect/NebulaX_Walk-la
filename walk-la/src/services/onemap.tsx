const ONEMAP_BASE_URL = "https://www.onemap.gov.sg";

export async function getWalkingRoute(
  startLat: number,
  startLng: number,
  endLat: number,
  endLng: number,
  token: string
) {
  const url =
    `${ONEMAP_BASE_URL}/api/public/routingsvc/route` +
    `?start=${startLat},${startLng}` +
    `&end=${endLat},${endLng}` +
    `&routeType=walk`;

  const response = await fetch(url, {
    method: "GET",
    headers: {
      Authorization: token,
    },
  });

  if (!response.ok) {
    throw new Error("Failed to get OneMap route");
  }

  return await response.json();
}
