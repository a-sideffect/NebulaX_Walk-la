const BACKEND_URL = "http://localhost:3001";

export async function getWeatherForecast() {
  const response = await fetch(
    `${BACKEND_URL}/api/weather/forecast`
  );

  if (!response.ok) {
    throw new Error("Failed to get weather forecast");
  }

  return await response.json();
}
