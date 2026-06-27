import { Router } from "express";
import { db } from "@workspace/db";
import { riskEventsTable, alertsTable } from "@workspace/db";
import { eq, desc, and } from "drizzle-orm";
import { logger } from "../lib/logger";

const router = Router();

router.get("/risk/data", async (req, res) => {
  const events = await db
    .select()
    .from(riskEventsTable)
    .orderBy(desc(riskEventsTable.timestamp))
    .limit(200);

  // Group by country and category to only return the latest per country-category pair
  const countryLatest: Record<string, typeof events[0]> = {};
  for (const e of events) {
    if (!countryLatest[`${e.country}-${e.category}`]) {
      countryLatest[`${e.country}-${e.category}`] = e;
    }
  }

  const result = Object.values(countryLatest).map((e) => ({
    id: e.id,
    country: e.country,
    region: e.region,
    category: e.category,
    riskScore: e.riskScore,
    riskLevel: e.riskLevel,
    source: e.source,
    timestamp: e.timestamp.toISOString(),
    isAnomaly: e.isAnomaly,
    lat: e.lat,
    lng: e.lng,
  }));

  res.json(result);
});

router.get("/risk/alerts", async (req, res) => {
  const alerts = await db
    .select()
    .from(alertsTable)
    .orderBy(desc(alertsTable.createdAt))
    .limit(50);

  const result = alerts.map((e) => ({
    id: e.id,
    title: e.title,
    description: e.description,
    severity: e.severity,
    source: e.source,
    country: e.country,
    createdAt: e.createdAt.toISOString(),
  }));

  res.json(result);
});

router.get("/risk/anomalies", async (req, res) => {
  const anomalies = await db
    .select()
    .from(riskEventsTable)
    .where(eq(riskEventsTable.isAnomaly, true))
    .orderBy(desc(riskEventsTable.riskScore))
    .limit(50);

  const result = anomalies.map((e) => ({
    id: e.id,
    country: e.country,
    region: e.region,
    category: e.category,
    riskScore: e.riskScore,
    riskLevel: e.riskLevel,
    source: e.source,
    timestamp: e.timestamp.toISOString(),
    isAnomaly: e.isAnomaly,
    lat: e.lat,
    lng: e.lng,
  }));

  res.json(result);
});

router.get("/risk/predict", async (req, res) => {
  const country = req.query.country as string;
  if (!country) {
    res.status(400).json({ error: "country query param required" });
    return;
  }

  const events = await db
    .select()
    .from(riskEventsTable)
    .where(eq(riskEventsTable.country, country))
    .orderBy(desc(riskEventsTable.timestamp))
    .limit(20);

  const avg = (arr: typeof events) =>
    arr.length > 0 ? arr.reduce((s, e) => s + e.riskScore, 0) / arr.length : 0.0;

  const climateEvents = events.filter((e) => e.category === "climate");
  const economicEvents = events.filter((e) => e.category === "economic");
  const supplyEvents = events.filter((e) => e.category === "supply_chain");

  const climate = avg(climateEvents);
  const economic = avg(economicEvents);
  const supplyChain = avg(supplyEvents);

  const riskScore = (climate * 0.35) + (economic * 0.4) + (supplyChain * 0.25);
  const predictedRiskLevel: "Low" | "Medium" | "High" =
    riskScore < 0.4 ? "Low" : riskScore < 0.7 ? "Medium" : "High";

  let explanation = "Prediction generated based on historical data averages.";
  let confidence = 0.6; // Default confidence

  // Call Gemini if API Key is present
  if (process.env.GEMINI_API_KEY) {
    try {
      const prompt = `Analyze the risk for ${country} based on the following recent event categories: Climate (${climate}), Economic (${economic}), Supply Chain (${supplyChain}). The calculated risk score is ${riskScore}. Provide a concise 2-sentence explanation of why the risk is at this level and what to watch out for.`;
      
      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${process.env.GEMINI_API_KEY}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: { temperature: 0.7 }
        })
      });

      if (response.ok) {
        const data = await response.json() as any;
        explanation = data.candidates?.[0]?.content?.parts?.[0]?.text || explanation;
        confidence = 0.85; // Higher confidence with AI reasoning
      }
    } catch (e) {
      logger.error({ err: e }, "Gemini API error during /predict");
    }
  }

  res.json({
    country,
    predictedRiskLevel,
    confidence,
    riskScore,
    explanation,
    features: {
      climate,
      economic,
      supplyChain,
    },
  });
});

router.get("/risk/forecast", async (req, res) => {
  const country = req.query.country as string;
  if (!country) {
    res.status(400).json({ error: "country query param required" });
    return;
  }

  const events = await db
    .select()
    .from(riskEventsTable)
    .where(eq(riskEventsTable.country, country))
    .orderBy(desc(riskEventsTable.timestamp))
    .limit(10);

  const baseScore = events.length > 0
    ? events.reduce((s, e) => s + e.riskScore, 0) / events.length
    : 0.1; // Default low risk if no data

  let forecast: { date: string; riskScore: number; riskLevel: "Low" | "Medium" | "High" }[] = [];

  if (process.env.GEMINI_API_KEY) {
    try {
      const prompt = `Generate a 7-day crisis risk forecast (scores from 0.0 to 1.0) for ${country}. The current base score is ${baseScore.toFixed(2)}. Return ONLY a raw JSON array of 7 numbers representing the scores for the next 7 days. Make the trend realistic based on standard crisis propagation. Do not include markdown formatting like \`\`\`json.`;
      
      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${process.env.GEMINI_API_KEY}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: { temperature: 0.5 }
        })
      });

      if (response.ok) {
        const data = await response.json() as any;
        const text = data.candidates?.[0]?.content?.parts?.[0]?.text || "[]";
        // Parse the JSON array
        const scores = JSON.parse(text.replace(/```json/g, '').replace(/```/g, '').trim());
        if (Array.isArray(scores) && scores.length >= 7) {
          forecast = scores.slice(0, 7).map((score, i) => {
            const date = new Date();
            date.setDate(date.getDate() + i + 1);
            const riskLevel: "Low" | "Medium" | "High" = score < 0.4 ? "Low" : score < 0.7 ? "Medium" : "High";
            return {
              date: date.toISOString().split("T")[0],
              riskScore: score,
              riskLevel,
            };
          });
        }
      }
    } catch (e) {
      logger.error({ err: e }, "Gemini API error during /forecast");
    }
  }

  // Fallback if Gemini fails or is not configured
  if (forecast.length === 0) {
    forecast = Array.from({ length: 7 }, (_, i) => {
      const date = new Date();
      date.setDate(date.getDate() + i + 1);
      const score = Math.min(1, Math.max(0, baseScore + (i * 0.02))); // slowly rising trend
      const riskLevel: "Low" | "Medium" | "High" = score < 0.4 ? "Low" : score < 0.7 ? "Medium" : "High";
      return {
        date: date.toISOString().split("T")[0],
        riskScore: score,
        riskLevel,
      };
    });
  }

  res.json({ country, forecast });
});

router.get("/risk/summary", async (req, res) => {
  const allEvents = await db.select().from(riskEventsTable);
  const highRisk = allEvents.filter((e) => e.riskLevel === "High");
  const anomalies = allEvents.filter((e) => e.isAnomaly);
  
  const allAlerts = await db.select().from(alertsTable);

  const highCountries = new Set(highRisk.map((e) => e.country));
  const avgScore =
    allEvents.length > 0 ? allEvents.reduce((s, e) => s + e.riskScore, 0) / allEvents.length : 0;

  res.json({
    totalAlerts: allAlerts.length,
    highRiskZones: highCountries.size,
    avgGlobalRiskScore: avgScore,
    anomaliesDetected: anomalies.length,
    totalCountries: new Set(allEvents.map((e) => e.country)).size,
    lastUpdated: new Date().toISOString(),
  });
});

router.get("/risk/history", async (req, res) => {
  const country = typeof req.query.country === "string" ? req.query.country.trim() : "";

  const all = await db
    .select()
    .from(riskEventsTable)
    .where(country ? eq(riskEventsTable.country, country) : undefined)
    .orderBy(riskEventsTable.timestamp);

  const dayMap: Record<string, Record<string, number[]>> = {};

  for (const e of all) {
    const day = e.timestamp.toISOString().split("T")[0];
    if (!dayMap[day]) dayMap[day] = { climate: [], economic: [], supply_chain: [] };
    if (dayMap[day][e.category]) {
      dayMap[day][e.category].push(e.riskScore);
    }
  }

  const avg = (arr: number[]) =>
    arr.length > 0 ? arr.reduce((s, v) => s + v, 0) / arr.length : null;

  const result = Object.entries(dayMap)
    .sort(([a], [b]) => a.localeCompare(b))
    .slice(-30)
    .map(([date, cats]) => ({
      date,
      climate: avg(cats.climate) ?? 0.0,
      economic: avg(cats.economic) ?? 0.0,
      supply_chain: avg(cats.supply_chain) ?? 0.0,
    }));

  res.json(result);
});

export default router;
