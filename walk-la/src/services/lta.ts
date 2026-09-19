// ========================================
// GET BUS ARRIVAL TIMINGS
// ========================================

export async function getBusArrivals(busStopCode: string, serviceNo?: string) {
  const params = new URLSearchParams({ busStopCode });
  if (serviceNo) params.append('serviceNo', serviceNo);

  const response = await fetch(`/api/lta/bus-arrival?${params}`);
  if (!response.ok) {
    throw new Error('Failed to get bus arrival information');
  }
  return await response.json();
}

// ========================================
// COVERED LINKWAYS
// ========================================

export async function getCoveredLinkways() {
  const response = await fetch('/api/lta/covered-linkways');
  if (!response.ok) {
    throw new Error('Failed to fetch Covered Linkway data');
  }
  return await response.json();
}