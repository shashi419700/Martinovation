import express from "express";

import {
  generateRouteRecommendation,
} from "../services/aiRouteService.js";

const router = express.Router();

const fallbackRecommendation = (destination) => {
  return {
    destination,

    recommendedRoute: "Route B",

    routeName:
      "Guwahati → Bomdila → Tawang",

    eta: "8h 05m",

    distance: "440 km",

    risk: "Low",

    riskPercentage: 18,

    confidence: 85,

    weather: {
      condition: "Light Rain",
      temperature: "19°C",
      visibility: "Good",
    },

    traffic: {
      level: "Moderate",
      delay: "12 min",
    },

    road: {
      condition: "Good",
      landslideRisk: "Low",
    },

    reason:
      "Route B currently provides the best balance between safety, road condition and travel time.",

    alternatives: [
      {
        name: "Route A",
        eta: "7h 35m",
        risk: "High",
        riskPercentage: 78,
      },
      {
        name: "Route B",
        eta: "8h 05m",
        risk: "Low",
        riskPercentage: 18,
      },
      {
        name: "Route C",
        eta: "9h 10m",
        risk: "Medium",
        riskPercentage: 42,
      },
    ],
  };
};


router.get("/ai-recommendation", async (req, res) => {
  try {
    const {
      latitude,
      longitude,
      destination,
    } = req.query;

    /*
    |--------------------------------------------------------------------------
    | Validation
    |--------------------------------------------------------------------------
    */

    if (
      latitude === undefined ||
      longitude === undefined
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Latitude and longitude are required.",
      });
    }

    if (!destination) {
      return res.status(400).json({
        success: false,
        message:
          "Destination is required.",
      });
    }

    const lat = Number(latitude);
    const lng = Number(longitude);

    if (
      Number.isNaN(lat) ||
      Number.isNaN(lng)
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Latitude and longitude must be valid numbers.",
      });
    }

    /*
    |--------------------------------------------------------------------------
    | Temporary data
    |--------------------------------------------------------------------------
    */

    const weather = {
      condition: "Light Rain",
      temperature: "19°C",
      visibility: "Good",
    };

    const traffic = {
      level: "Moderate",
      delay: "12 min",
    };

    const road = {
      condition: "Good",
      landslideRisk: "Low",
    };

    /*
    |--------------------------------------------------------------------------
    | Gemini AI
    |--------------------------------------------------------------------------
    */

    try {
      const aiResult =
        await generateRouteRecommendation({
          latitude: lat,
          longitude: lng,
          destination,
          weather,
          traffic,
          road,
        });

      return res.status(200).json({
        success: true,

        data: {
          ...aiResult,
          weather,
          traffic,
          road,
        },

        meta: {
          fallback: false,
          generatedAt:
            new Date().toISOString(),
        },
      });
    } catch (aiError) {
      console.error(
        "Gemini AI Error:",
        aiError.message,
      );

      return res.status(200).json({
        success: true,

        data: fallbackRecommendation(
          destination,
        ),

        meta: {
          fallback: true,
          message:
            "Gemini temporarily unavailable.",
          generatedAt:
            new Date().toISOString(),
        },
      });
    }
  } catch (error) {
    console.error(
      "AI Recommendation Error:",
      error,
    );

    return res.status(500).json({
      success: false,
      message:
        "Unable to generate route recommendation.",
    });
  }
});

export default router;
