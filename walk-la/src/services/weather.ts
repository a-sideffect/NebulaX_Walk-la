export async function getWeatherForecast() {
  const response = await fetch('/api/weather/forecast');
  if (!response.ok) {
    throw new Error('Failed to get weather forecast');
  }
  return await response.json();
}