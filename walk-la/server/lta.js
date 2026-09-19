import express from "express";
import "dotenv/config";

const router = express.Router();

const LTA_BASE_URL = "https://datamall2.mytransport.sg/ltaodataservice/v3";

// ========================================
// BUS ARRIVAL TIMINGS
// ========================================

router.get("/bus-arrival", async (req, res) => {
  try {
    const { busStopCode, serviceNo } = req.query;

    if (!busStopCode) {
      return res.status(400).json({
        error: "busStopCode is required",
      });
    }

    const params = new URLSearchParams({
      BusStopCode: busStopCode,
    });

    if (serviceNo) {
      params.append("ServiceNo", serviceNo);
    }

    const response = await fetch(`${LTA_BASE_URL}/BusArrival?${params}`, {
      method: "GET",
      headers: {
        AccountKey: process.env.LTA_ACCOUNT_KEY,
        Accept: "application/json",
      },
    });

    const data = await response.json();

    if (!response.ok) {
      console.error("LTA API error:", data);
      return res.status(response.status).json(data);
    }

    res.json(data);
  } catch (error) {
    console.error("LTA bus arrival error:", error);
    res.status(500).json({
      error: "Failed to retrieve bus arrival information",
    });
  }
});

// ========================================
// COVERED LINKWAYS
// ========================================

router.get("/covered-linkways", async (req, res) => {
  try {
    const response = await fetch(
      "https://datamall2.mytransport.sg/ltaodataservice/GeospatialWholeIsland?ID=CoveredLinkWay",
      {
        method: "GET",
        headers: {
          AccountKey: process.env.LTA_ACCOUNT_KEY,
        },
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error("LTA Covered Linkway request failed:", errorText);
      return res.status(response.status).json({
        error: "Failed to fetch Covered Linkway data",
      });
    }

    const data = await response.json();
    res.json(data);
  } catch (error) {
    console.error("Covered Linkway error:", error);
    res.status(500).json({
      error: "Failed to fetch Covered Linkway data",
    });
  }
});

export default router;
