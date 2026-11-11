import { Router } from "express";
import { logger } from "../lib/logger";
import { mockDb } from "../mock-db";

const router = Router();

// ─── Helper: get data from real DB or mock ───────────────────────────────────

async function getRiskEvents(useReal: boolean) {
  if (useReal) {
    const { db, riskEventsTable } = await import("@workspace/db");
    const { desc } = await import("drizzle-orm");
    return db.select().from(riskEventsTable).orderBy(desc(riskEventsTable.timestamp)).limit(200);
  }
  return mockDb.getRiskEvents().sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime()).slice(0, 200);
}

async function getAlerts(useReal: boolean) {
  if (useReal) {
    const { db, alertsTable } = await import("@workspace/db");
    const { desc } = await import("drizzle-orm");
    return db.select().from(alertsTable).orderBy(desc(alertsTable.createdAt)).limit(50);
  }
  return mockDb.getAlerts().sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime()).slice(0, 50);
}

async function getAnomalies(useReal: boolean) {
  if (useReal) {
    const { db, riskEventsTable } = await import("@workspace/db");
    const { eq, desc } = await import("drizzle-orm");
    return db.select().from(riskEventsTable).where(eq(riskEventsTable.isAnomaly, true)).orderBy(desc(riskEventsTable.riskScore)).limit(50);
  }
  return mockDb.getRiskEvents().filter(e => e.isAnomaly).sort((a, b) => b.riskScore - a.riskScore).slice(0, 50);
}

async function getEventsByCountry(country: string, useReal: boolean, limit = 20) {
  if (useReal) {
    const { db, riskEventsTable } = await import("@workspace/db");
    const { eq, desc } = await import("drizzle-orm");
    return db.select().from(riskEventsTable).where(eq(riskEventsTable.country, country)).orderBy(desc(riskEventsTable.timestamp)).limit(limit);
  }
  return mockDb.getRiskEvents().filter(e => e.country === country).sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime()).slice(0, limit);
}

async function getAllEvents(useReal: boolean) {
  if (useReal) {
    const { db, riskEventsTable } = await import("@workspace/db");
    return db.select().from(riskEventsTable);
  }
  return mockDb.getRiskEvents();
}

async function getAllAlerts(useReal: boolean) {
  if (useReal) {
    const { db, alertsTable } = await import("@workspace/db");
    return db.select().from(alertsTable);
  }
  return mockDb.getAlerts();
}

// ─── Routes ──────────────────────────────────────────────────────────────────

router.get("/risk/data", async (req, res) => {
  try {
    const useReal: boolean = (req.app.locals as any).useRealDb ?? false;
    const events = await getRiskEvents(useReal);

    const countryLatest: Record<string, typeof events[0]> = {};
    for (const e of events) {
      if (!e.country || e.country.trim().toLowerCase() === "global" || e.country.trim().toLowerCase() === "unknown") {
        continue;
      }
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
  } catch (err) {
    logger.error({ err }, "GET /risk/data error");
    res.status(500).json({ error: "Failed to fetch risk data" });
  }
});

router.get("/risk/alerts", async (req, res) => {
  try {
    const useReal: boolean = (req.app.locals as any).useRealDb ?? false;
    const alerts = await getAlerts(useReal);

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
  } catch (err) {
    logger.error({ err }, "GET /risk/alerts error");
    res.status(500).json({ error: "Failed to fetch alerts" });
  }
});

router.get("/risk/anomalies", async (req, res) => {
  try {
    const useReal: boolean = (req.app.locals as any).useRealDb ?? false;
    const anomalies = await getAnomalies(useReal);

    const result = anomalies
      .filter((e) => e.country && e.country.trim().toLowerCase() !== "global" && e.country.trim().toLowerCase() !== "unknown")
      .map((e) => ({
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
  } catch (err) {
    logger.error({ err }, "GET /risk/anomalies error");
    res.status(500).json({ error: "Failed to fetch anomalies" });
  }
});

router.get("/risk/predict", async (req, res) => {
  try {
    const country = req.query.country as string;
    if (!country) {
      res.status(400).json({ error: "country query param required" });
      return;
    }

    const useReal: boolean = (req.app.locals as any).useRealDb ?? false;
    const events = await getEventsByCountry(country, useReal, 20);

    const avg = (arr: typeof events) =>
      arr.length > 0 ? arr.reduce((s, e) => s + e.riskScore, 0) / arr.length : 0.0;

    const climateEvents = events.filter((e) => e.category === "climate");
    const economicEvents = events.filter((e) => e.category === "economic");
    const supplyEvents = events.filter((e) => e.category === "supply_chain");

    const climate = avg(climateEvents);
    const economic = avg(economicEvents);
    const supplyChain = avg(supplyEvents);

    const riskScore = climate * 0.35 + economic * 0.4 + supplyChain * 0.25;
    const predictedRiskLevel: "Low" | "Medium" | "High" =
      riskScore < 0.4 ? "Low" : riskScore < 0.7 ? "Medium" : "High";

    let explanation = "Prediction generated based on historical data averages.";
    let confidence = 0.6;

    if (process.env.GEMINI_API_KEY) {
      try {
        const prompt = `Analyze the risk for ${country} based on: Climate (${climate.toFixed(2)}), Economic (${economic.toFixed(2)}), Supply Chain (${supplyChain.toFixed(2)}). Calculated risk score: ${riskScore.toFixed(2)}. Provide a concise 2-sentence explanation.`;

        const response: any = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${process.env.GEMINI_API_KEY}`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              contents: [{ parts: [{ text: prompt }] }],
              generationConfig: { temperature: 0.7 },
            }),
          },
        );

        if (response.ok) {
          const data = await response.json() as any;
          explanation = data.candidates?.[0]?.content?.parts?.[0]?.text || explanation;
          confidence = 0.85;
        }
      } catch (e) {
        logger.warn({ err: e }, "Gemini API error during /predict (continuing with defaults)");
      }
    }

    res.json({
      country,
      predictedRiskLevel,
      confidence,
      riskScore,
      explanation,
      features: { climate, economic, supplyChain },
    });
  } catch (err) {
    logger.error({ err }, "GET /risk/predict error");
    res.status(500).json({ error: "Failed to generate prediction" });
  }
});

router.get("/risk/forecast", async (req, res) => {
  try {
    const country = req.query.country as string;
    if (!country) {
      res.status(400).json({ error: "country query param required" });
      return;
    }

    const useReal: boolean = (req.app.locals as any).useRealDb ?? false;
    const events = await getEventsByCountry(country, useReal, 10);

    const baseScore =
      events.length > 0
        ? events.reduce((s, e) => s + e.riskScore, 0) / events.length
        : 0.1;

    let forecast: { date: string; riskScore: number; riskLevel: "Low" | "Medium" | "High" }[] = [];

    if (process.env.GEMINI_API_KEY) {
      try {
        const prompt = `Generate a 7-day crisis risk forecast (scores 0.0–1.0) for ${country}. Current base score: ${baseScore.toFixed(2)}. Return ONLY a raw JSON array of 7 numbers. No markdown.`;

        const response: any = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${process.env.GEMINI_API_KEY}`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              contents: [{ parts: [{ text: prompt }] }],
              generationConfig: { temperature: 0.5 },
            }),
          },
        );

        if (response.ok) {
          const data = await response.json() as any;
          const text = data.candidates?.[0]?.content?.parts?.[0]?.text || "[]";
          const scores = JSON.parse(text.replace(/```json/g, "").replace(/```/g, "").trim());
          if (Array.isArray(scores) && scores.length >= 7) {
            forecast = scores.slice(0, 7).map((score, i) => {
              const date = new Date();
              date.setDate(date.getDate() + i + 1);
              const riskLevel: "Low" | "Medium" | "High" = score < 0.4 ? "Low" : score < 0.7 ? "Medium" : "High";
              return { date: date.toISOString().split("T")[0], riskScore: score, riskLevel };
            });
          }
        }
      } catch (e) {
        logger.warn({ err: e }, "Gemini API error during /forecast (continuing with defaults)");
      }
    }

    if (forecast.length === 0) {
      forecast = Array.from({ length: 7 }, (_, i) => {
        const date = new Date();
        date.setDate(date.getDate() + i + 1);
        const score = Math.min(1, Math.max(0, baseScore + i * 0.02));
        const riskLevel: "Low" | "Medium" | "High" = score < 0.4 ? "Low" : score < 0.7 ? "Medium" : "High";
        return { date: date.toISOString().split("T")[0], riskScore: score, riskLevel };
      });
    }

    res.json({ country, forecast });
  } catch (err) {
    logger.error({ err }, "GET /risk/forecast error");
    res.status(500).json({ error: "Failed to generate forecast" });
  }
});

router.get("/risk/summary", async (req, res) => {
  try {
    const useReal: boolean = (req.app.locals as any).useRealDb ?? false;
    const allEvents = await getAllEvents(useReal);
    const allAlerts = await getAllAlerts(useReal);

    const validCountryEvents = allEvents.filter(
      (e) => e.country && e.country.trim().toLowerCase() !== "global" && e.country.trim().toLowerCase() !== "unknown"
    );
    const highRisk = validCountryEvents.filter((e) => e.riskLevel === "High");
    const anomalies = validCountryEvents.filter((e) => e.isAnomaly);
    const highCountries = new Set(highRisk.map((e) => e.country));
    const avgScore =
      validCountryEvents.length > 0
        ? validCountryEvents.reduce((s, e) => s + e.riskScore, 0) / validCountryEvents.length
        : 0;

    res.json({
      totalAlerts: allAlerts.length,
      highRiskZones: highCountries.size,
      avgGlobalRiskScore: avgScore,
      anomaliesDetected: anomalies.length,
      totalCountries: new Set(validCountryEvents.map((e) => e.country)).size,
      lastUpdated: new Date().toISOString(),
    });
  } catch (err) {
    logger.error({ err }, "GET /risk/summary error");
    res.status(500).json({ error: "Failed to fetch summary" });
  }
});

router.get("/risk/history", async (req, res) => {
  try {
    const country = typeof req.query.country === "string" ? req.query.country.trim() : "";
    const useReal: boolean = (req.app.locals as any).useRealDb ?? false;

    let all: { timestamp: Date; category: string; riskScore: number }[];

    if (useReal) {
      const { db, riskEventsTable } = await import("@workspace/db");
      const { eq } = await import("drizzle-orm");
      all = await db
        .select()
        .from(riskEventsTable)
        .where(country ? eq(riskEventsTable.country, country) : undefined)
        .orderBy(riskEventsTable.timestamp);
    } else {
      all = mockDb
        .getRiskEvents()
        .filter((e) => !country || e.country === country)
        .sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());
    }

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
  } catch (err) {
    logger.error({ err }, "GET /risk/history error");
    res.status(500).json({ error: "Failed to fetch history" });
  }
});

export default router;
