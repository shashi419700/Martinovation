import {
  GoogleGenerativeAI,
} from "@google/generative-ai";

const genAI =
  new GoogleGenerativeAI(
    process.env.GEMINI_API_KEY,
  );

const MODEL =
  process.env.GEMINI_MODEL ||
  "gemini-2.0-flash";

export const generateRouteRecommendation =
  async ({
    latitude,
    longitude,
    destination,
    weather,
    traffic,
    road,
  }) => {
    if (!process.env.GEMINI_API_KEY) {
      throw new Error(
        "GEMINI_API_KEY is missing.",
      );
    }

    const model =
      genAI.getGenerativeModel({
        model: MODEL,

        generationConfig: {
          temperature: 0.2,
          responseMimeType:
            "application/json",
        },
      });

    const prompt = `
You are an AI route safety assistant.

Analyse a journey from the user's current
location to the requested destination.

CURRENT LOCATION:
Latitude: ${latitude}
Longitude: ${longitude}

DESTINATION:
${destination}

WEATHER:
${JSON.stringify(weather)}

TRAFFIC:
${JSON.stringify(traffic)}

ROAD:
${JSON.stringify(road)}

Your responsibilities:

- Recommend the safest practical route.
- Consider travel time.
- Consider weather.
- Consider traffic.
- Consider road condition.
- Consider landslide risk.
- Calculate risk from 0 to 100.
- Calculate AI confidence from 0 to 100.
- Give 2 or 3 alternative routes.
- Explain why the recommended route is better.

IMPORTANT:

- Do not invent live information.
- Use only supplied data.
- Lower risk percentage means safer.
- Keep the response concise.
- Return ONLY JSON.
- Do not use markdown.
- Do not use code fences.

Return exactly:

{
  "destination": "string",
  "recommendedRoute": "string",
  "routeName": "string",
  "eta": "string",
  "distance": "string",
  "risk": "Low | Medium | High",
  "riskPercentage": 0,
  "confidence": 0,
  "reason": "string",
  "alternatives": [
    {
      "name": "string",
      "eta": "string",
      "risk": "Low | Medium | High",
      "riskPercentage": 0
    }
  ]
}
`;

    const result =
      await model.generateContent(
        prompt,
      );

    const text =
      result.response.text();

    if (!text) {
      throw new Error(
        "Gemini returned empty response.",
      );
    }

    let data;

    try {
      data = JSON.parse(text);
    } catch (error) {
      console.error(
        "Gemini invalid JSON:",
        text,
      );

      throw new Error(
        "Gemini returned invalid JSON.",
      );
    }

    return normalizeResponse(data);
  };


const normalizeResponse = (
  data,
) => {
  const validRisks = [
    "Low",
    "Medium",
    "High",
  ];

  const risk = validRisks.includes(
    data.risk,
  )
    ? data.risk
    : "Medium";

  const riskPercentage =
    clampNumber(
      data.riskPercentage,
      50,
    );

  const confidence =
    clampNumber(
      data.confidence,
      70,
    );

  const alternatives =
    Array.isArray(data.alternatives)
      ? data.alternatives
          .slice(0, 3)
          .map((route) => ({
            name:
              route.name ||
              "Alternative Route",

            eta:
              route.eta || "N/A",

            risk: validRisks.includes(
              route.risk,
            )
              ? route.risk
              : "Medium",

            riskPercentage:
              clampNumber(
                route.riskPercentage,
                50,
              ),
          }))
      : [];

  return {
    destination:
      data.destination ||
      "Unknown",

    recommendedRoute:
      data.recommendedRoute ||
      "Recommended Route",

    routeName:
      data.routeName ||
      "Best available route",

    eta:
      data.eta || "N/A",

    distance:
      data.distance || "N/A",

    risk,

    riskPercentage,

    confidence,

    reason:
      data.reason ||
      "This route currently provides the best available balance of safety and travel time.",

    alternatives,
  };
};


const clampNumber = (
  value,
  fallback,
) => {
  const number = Number(value);

  if (Number.isNaN(number)) {
    return fallback;
  }

  return Math.min(
    100,
    Math.max(0, number),
  );
};
