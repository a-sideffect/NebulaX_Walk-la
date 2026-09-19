import express from "express";
import "dotenv/config";

const router = express.Router();

const WEATHER_BASE_URL =
  "https://api-open.data.gov.sg/v2/real-time/api";


// ========================================
// 2-HOUR WEATHER FORECAST
// ========================================

router.get("/forecast", async (req, res) => {
  try {
    const response = await fetch(
      `${WEATHER_BASE_URL}/two-hr-forecast`,
      {
        method: "GET",
        headers: {
          "x-api-key": process.env.DATAGOV_API_KEY,
        },
      }
    );

    const data = await response.json();

    if (!response.ok) {
      console.error("Data.gov.sg weather error:", data);

      return res.status(response.status).json({
        error: "Failed to get weather data",
      });
    }

    res.json(data);

  } catch (error) {
    console.error("Weather API error:", error);

    res.status(500).json({
      error: "Weather API request failed",
    });
  }
});

export default router;
