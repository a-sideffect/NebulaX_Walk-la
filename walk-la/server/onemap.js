import express from "express";
import cors from "cors";
import "dotenv/config";

console.log("OneMap email loaded:", !!process.env.ONEMAP_EMAIL);
console.log("OneMap password loaded:", !!process.env.ONEMAP_PASSWORD);

const app = express();

app.use(cors());
app.use(express.json());

const ONEMAP_BASE_URL = "https://www.onemap.gov.sg";

let accessToken = null;
let tokenExpiry = 0;


// ========================================
// GET ONEMAP ACCESS TOKEN
// ========================================

async function getAccessToken() {
  // Reuse existing token if it is still valid
  if (accessToken && Date.now() < tokenExpiry) {
    return accessToken;
  }

  const response = await fetch(
    `${ONEMAP_BASE_URL}/api/auth/post/getToken`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email: process.env.ONEMAP_EMAIL,
        password: process.env.ONEMAP_PASSWORD,
      }),
    }
  );

  if (!response.ok) {
    const errorText = await response.text();
    console.error("OneMap authentication failed:", errorText);
    throw new Error("Failed to authenticate with OneMap");
  }

  const data = await response.json();

  accessToken = data.access_token;

  // OneMap tokens are valid for 3 days.
  // Refresh before the full expiry.
  tokenExpiry = Date.now() + 70 * 60 * 60 * 1000;

  return accessToken;
}


// ========================================
// SEARCH LOCATIONS
// ========================================

app.get("/api/onemap/search", async (req, res) => {
  try {
    const searchValue = req.query.searchVal;

    if (!searchValue) {
      return res.status(400).json({
        error: "searchVal is required",
      });
    }

    const token = await getAccessToken();

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

    const data = await response.json();

    res.status(response.status).json(data);

  } catch (error) {
    console.error("OneMap search error:", error);

    res.status(500).json({
      error: "OneMap search failed",
    });
  }
});


// ========================================
// WALKING ROUTE
// ========================================

app.get("/api/onemap/route", async (req, res) => {
  try {
    const {
      startLat,
      startLng,
      endLat,
      endLng,
    } = req.query;

    if (!startLat || !startLng || !endLat || !endLng) {
      return res.status(400).json({
        error: "Missing route coordinates",
      });
    }

    const token = await getAccessToken();

    const params = new URLSearchParams({
      start: `${startLat},${startLng}`,
      end: `${endLat},${endLng}`,
      routeType: "walk",
    });

    const response = await fetch(
      `${ONEMAP_BASE_URL}/api/public/routingsvc/route?${params}`,
      {
        method: "GET",
        headers: {
          Authorization: token,
        },
      }
    );

    const data = await response.json();

    res.status(response.status).json(data);

  } catch (error) {
    console.error("OneMap routing error:", error);

    res.status(500).json({
      error: "OneMap route failed",
    });
  }
});


// ========================================
// START SERVER
// ========================================

const PORT = process.env.PORT || 3001;

app.listen(PORT, () => {
  console.log(`OneMap backend running on http://localhost:${PORT}`);
});
