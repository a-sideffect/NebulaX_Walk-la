import express from "express";
import cors from "cors";
import "dotenv/config";

const app = express();

app.use(cors());
app.use(express.json());

const LTA_BASE_URL =
  "https://datamall2.mytransport.sg/ltaodataservice/v3";


// ========================================
// BUS ARRIVAL TIMINGS
// ========================================

app.get("/api/lta/bus-arrival", async (req, res) => {
  try {
    const { busStopCode, serviceNo } = req.query;

    // Make sure a bus stop was provided
    if (!busStopCode) {
      return res.status(400).json({
        error: "busStopCode is required",
      });
    }

    // Build the LTA API request
    const params = new URLSearchParams({
      BusStopCode: busStopCode,
    });

    // ServiceNo is optional
    if (serviceNo) {
      params.append("ServiceNo", serviceNo);
    }

    // Call LTA DataMall
    const response = await fetch(
      `${LTA_BASE_URL}/BusArrival?${params}`,
      {
        method: "GET",
        headers: {
          AccountKey: process.env.LTA_ACCOUNT_KEY,
          Accept: "application/json",
        },
      }
    );

    const data = await response.json();

    // If LTA returns an error
    if (!response.ok) {
      console.error("LTA API error:", data);

      return res.status(response.status).json(data);
    }

    // Send LTA's response back to our frontend
    res.json(data);

  } catch (error) {
    console.error("LTA bus arrival error:", error);

    res.status(500).json({
      error: "Failed to retrieve bus arrival information",
    });
  }
});


// ========================================
// START SERVER
// ========================================

const PORT = process.env.LTA_PORT || 3002;

app.listen(PORT, () => {
  console.log(
    `LTA backend running on http://localhost:${PORT}`
  );
});

// ========================================
// COVERED LINKWAYS
// ========================================

app.get("/api/lta/covered-linkways", async (req, res) => {
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

      console.error(
        "LTA Covered Linkway request failed:",
        errorText
      );

      return res.status(response.status).json({
        error: "Failed to fetch Covered Linkway data",
      });
    }

    const data = await response.json();

    res.json(data);

  } catch (error) {
    console.error(
      "Covered Linkway error:",
      error
    );

    res.status(500).json({
      error: "Failed to fetch Covered Linkway data",
    });
  }
});
