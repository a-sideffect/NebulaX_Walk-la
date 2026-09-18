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
      Authorization: eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyX2lkIjoyNDkxMywiZm9yZXZlciI6ZmFsc2UsImlzcyI6Ik9uZU1hcCIsImlhdCI6MTc4OTc1NjkyMCwibmJmIjoxNzg5NzU2OTIwLCJleHAiOjE3OTAwMTYxMjAsImp0aSI6IjE1YzIxNGRhLTVkY2EtNGUwMi05NTZmLTBiZmNmMzk2MDkzZSJ9.ZPubMsLtV-rKNfeCIfEnD0fK51Vf-uCnHJyGmkumKpwTvib8EknNy7_btXdsZO4XLWCeGeO814aIi9ylIqAhVlgjVqKey82zWT1krUMk9QORN6CAqvsYTnsnv_fQ0bVSPHRhVsTADxvHaWccAXKZQcP83okqkmszscjVYASgA9fJ_Jlx1qHG8S_xnBnNReqFKoYXmlW8YIlqIPbc8zsS_N6ybGnVUKIyYUbPU49-82EICCgD6en7U8ZX4QN5o1QekAH96bdLL2rzYAiRuRqZva05c6hgwpsTxOM31g_Qwx_SiNtR1-PRtekGulfcZgnArP2Fl9YTn9ciGBZBCkNzXg,
    },
  });

  if (!response.ok) {
    throw new Error("Failed to find route");
  }

  return await response.json();
}

export async function searchLocations(
  searchValue: string,
  token: string
) {
  const params = new URLSearchParams({
    searchVal: searchValue,
    returnGeom: "Y",
    getAddrDetails: "Y",
    pageNum: "1",
  });

  const response = await fetch(
    `${ONEMAP_BASE_URL}/api/common/elastic/search?${params}`,
    {
      method: "GET",
      headers: {
        Authorization: token,
      },
    }
  );

  if (!response.ok) {
    throw new Error("Failed to search OneMap");
  }

  return await response.json();
}
