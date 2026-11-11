import { logger } from "./lib/logger";
import { mockDb } from "./mock-db";

const MAJOR_CITIES = [
  { name: "New York", country: "USA", lat: 40.71, lng: -74.00, region: "North America" },
  { name: "London", country: "UK", lat: 51.50, lng: -0.12, region: "Europe" },
  { name: "Tokyo", country: "Japan", lat: 35.67, lng: 139.65, region: "Asia" },
  { name: "Sydney", country: "Australia", lat: -33.86, lng: 151.20, region: "Oceania" },
  { name: "Sao Paulo", country: "Brazil", lat: -23.55, lng: -46.63, region: "South America" },
  { name: "Cape Town", country: "South Africa", lat: -33.92, lng: 18.42, region: "Africa" },
  { name: "Mumbai", country: "India", lat: 19.07, lng: 72.87, region: "Asia" },
  { name: "Berlin", country: "Germany", lat: 52.52, lng: 13.40, region: "Europe" },
  { name: "Shanghai", country: "China", lat: 31.23, lng: 121.47, region: "Asia" },
  { name: "Lagos", country: "Nigeria", lat: 6.52, lng: 3.38, region: "Africa" },
];

const COUNTRY_KEYWORDS: Record<string, { lat: number; lng: number; region: string }> = {
  "United States": { lat: 38.9, lng: -77.0, region: "North America" },
  "USA": { lat: 38.9, lng: -77.0, region: "North America" },
  "America": { lat: 38.9, lng: -77.0, region: "North America" },
  "China": { lat: 35.86, lng: 104.19, region: "Asia" },
  "Europe": { lat: 54.53, lng: 15.25, region: "Europe" },
  "EU": { lat: 50.85, lng: 4.35, region: "Europe" },
  "Germany": { lat: 51.16, lng: 10.45, region: "Europe" },
  "UK": { lat: 55.38, lng: -3.44, region: "Europe" },
  "Britain": { lat: 55.38, lng: -3.44, region: "Europe" },
  "France": { lat: 46.23, lng: 2.21, region: "Europe" },
  "Japan": { lat: 36.20, lng: 138.25, region: "Asia" },
  "India": { lat: 20.59, lng: 78.96, region: "Asia" },
  "Russia": { lat: 61.52, lng: 105.31, region: "Europe" },
  "Ukraine": { lat: 48.37, lng: 31.16, region: "Europe" },
  "Middle East": { lat: 29.31, lng: 47.48, region: "Middle East" },
  "Saudi Arabia": { lat: 23.88, lng: 45.08, region: "Middle East" },
  "Iran": { lat: 32.42, lng: 53.68, region: "Middle East" },
  "Israel": { lat: 31.04, lng: 34.85, region: "Middle East" },
  "Brazil": { lat: -14.24, lng: -51.93, region: "South America" },
  "Argentina": { lat: -38.41, lng: -63.61, region: "South America" },
  "Africa": { lat: -8.78, lng: 34.50, region: "Africa" },
  "Nigeria": { lat: 9.08, lng: 8.67, region: "Africa" },
  "South Africa": { lat: -30.56, lng: 22.94, region: "Africa" },
  "Australia": { lat: -25.27, lng: 133.78, region: "Oceania" },
  "Canada": { lat: 56.13, lng: -106.35, region: "North America" },
  "Mexico": { lat: 23.63, lng: -102.55, region: "North America" },
  "Turkey": { lat: 38.96, lng: 35.24, region: "Middle East" },
  "Pakistan": { lat: 30.37, lng: 69.34, region: "Asia" },
  "Indonesia": { lat: -0.79, lng: 113.92, region: "Asia" },
  "South Korea": { lat: 35.91, lng: 127.77, region: "Asia" },
  "Taiwan": { lat: 23.69, lng: 120.96, region: "Asia" },
  "Vietnam": { lat: 14.06, lng: 108.28, region: "Asia" },
  "Thailand": { lat: 15.87, lng: 100.99, region: "Asia" },
};

function extractCountryFromText(text: string): { country: string; lat: number; lng: number; region: string } | null {
  const lowerText = text.toLowerCase();
  for (const [keyword, location] of Object.entries(COUNTRY_KEYWORDS)) {
    if (lowerText.includes(keyword.toLowerCase())) {
      return { country: keyword, ...location };
    }
  }
  return null;
}

function calculateRisk(climate: number, economic: number, supplyChain: number) {
  const score = climate * 0.35 + economic * 0.4 + supplyChain * 0.25;
  let level: "Low" | "Medium" | "High" = "Low";
  if (score >= 0.7) level = "High";
  else if (score >= 0.4) level = "Medium";
  return { score, level };
}

// ─── Unified Insert Helpers ──────────────────────────────────────────────────

async function saveRiskEvent(
  useRealDb: boolean,
  data: {
    country: string;
    region: string;
    category: "climate" | "economic" | "supply_chain";
    riskScore: number;
    riskLevel: "Low" | "Medium" | "High";
    source: string;
    isAnomaly: boolean;
    lat: number;
    lng: number;
    timestamp?: Date;
  }
) {
  if (useRealDb) {
    try {
      const { db, riskEventsTable } = await import("@workspace/db");
      await db.insert(riskEventsTable).values(data as any).onConflictDoNothing();
    } catch (e) {
      logger.warn({ err: e }, "Failed to write event to PostgreSQL, writing to memory store");
      mockDb.insertRiskEvent(data);
    }
  } else {
    mockDb.insertRiskEvent(data);
  }
}

async function saveAlert(
  useRealDb: boolean,
  data: {
    title: string;
    description: string;
    severity: string;
    source: string;
    country: string;
  }
) {
  if (useRealDb) {
    try {
      const { db, alertsTable } = await import("@workspace/db");
      await db.insert(alertsTable).values(data).onConflictDoNothing();
    } catch (e) {
      logger.warn({ err: e }, "Failed to write alert to PostgreSQL, writing to memory store");
      mockDb.insertAlert(data);
    }
  } else {
    mockDb.insertAlert(data);
  }
}

// ─── Scheduler ────────────────────────────────────────────────────────────────

export function startScheduler(useRealDb = false) {
  logger.info({ useRealDb }, "Scheduler starting background live data ingestion");

  const INTERVAL = 15 * 60 * 1000; // Run every 15 minutes
  setInterval(async () => {
    try {
      await runBackgroundJobs(useRealDb);
    } catch (e) {
      logger.error({ err: e }, "Scheduler interval error");
    }
  }, INTERVAL);

  // Run initial live ingest after 3 seconds
  setTimeout(() => {
    runBackgroundJobs(useRealDb).catch((e) =>
      logger.error({ err: e }, "Initial scheduler run error")
    );
  }, 3000);
}

async function runBackgroundJobs(useRealDb: boolean) {
  logger.info("Executing live data fetching from external APIs (USGS, ReliefWeb, News, Weather)...");
  const results = await Promise.allSettled([
    fetchUSGS(useRealDb),
    fetchReliefWeb(useRealDb),
    fetchNewsAPI(useRealDb),
    fetchOpenWeather(useRealDb),
  ]);

  for (const r of results) {
    if (r.status === "rejected") {
      logger.warn({ reason: r.reason }, "One of the live feeds failed to fetch");
    }
  }
  logger.info("Live data fetching completed.");
}

// ─── Live External Feed 1: USGS Earthquakes (Real-time live) ──────────────────

async function fetchUSGS(useRealDb: boolean) {
  try {
    const res: any = await fetch(
      "https://earthquake.usgs.gov/fdsnws/event/1/query?format=geojson&minmagnitude=4.5&limit=15"
    );
    if (!res.ok) return;
    const data = (await res.json()) as any;
    let added = 0;

    for (const feature of data.features || []) {
      const mag = feature.properties?.mag ?? 5.0;
      const place = feature.properties?.place || "Unknown";
      const [lng, lat] = feature.geometry?.coordinates || [0, 0];

      const climateRisk = Math.min(1.0, Math.max(0.3, mag / 8.0));
      const { score, level } = calculateRisk(climateRisk, 0.2, 0.3);
      const countryMatch = place.split(", ").pop() || "Global";

      await saveRiskEvent(useRealDb, {
        country: countryMatch,
        region: "Global",
        category: "climate",
        riskScore: Number(score.toFixed(2)),
        riskLevel: level,
        source: "USGS Live",
        isAnomaly: mag >= 6.0,
        lat: Number(lat.toFixed(2)),
        lng: Number(lng.toFixed(2)),
        timestamp: new Date(feature.properties?.time || Date.now()),
      });
      added++;

      if (mag >= 6.0) {
        await saveAlert(useRealDb, {
          title: `Major Earthquake M${mag.toFixed(1)}: ${place}`,
          description: `Live USGS detection: Magnitude ${mag} earthquake at depth ${feature.geometry?.coordinates?.[2] ?? 10}km.`,
          severity: "High",
          source: "USGS Live",
          country: countryMatch,
        });
      }
    }
    logger.info({ count: added }, "Ingested live USGS earthquake events");
  } catch (e: any) {
    logger.warn({ err: e.message }, "Live USGS feed unavailable");
  }
}

// ─── Live External Feed 2: ReliefWeb Humanitarian Reports (UN OCHA) ───────────

async function fetchReliefWeb(useRealDb: boolean) {
  try {
    const res: any = await fetch(
      "https://api.reliefweb.int/v1/reports?appname=crisisscope&limit=12&profile=full"
    );
    if (!res.ok) return;
    const data = (await res.json()) as any;
    let added = 0;

    for (const item of data.data || []) {
      const country = item.fields?.primary_country?.name || "Global";
      const title = item.fields?.title || "ReliefWeb Humanitarian Crisis";
      const lat = item.fields?.primary_country?.location?.lat || 0;
      const lng = item.fields?.primary_country?.location?.lon || 0;

      const { score, level } = calculateRisk(0.82, 0.5, 0.65);

      await saveRiskEvent(useRealDb, {
        country,
        region: "Global",
        category: "climate",
        riskScore: Number(score.toFixed(2)),
        riskLevel: level,
        source: "ReliefWeb Live",
        isAnomaly: level === "High",
        lat: Number(lat.toFixed(2)),
        lng: Number(lng.toFixed(2)),
        timestamp: new Date(item.fields?.date?.created || Date.now()),
      });
      added++;

      if (level === "High") {
        await saveAlert(useRealDb, {
          title: `Humanitarian Situation: ${country}`,
          description: title.substring(0, 180),
          severity: "High",
          source: "ReliefWeb Live",
          country,
        });
      }
    }
    logger.info({ count: added }, "Ingested live ReliefWeb humanitarian events");
  } catch (e: any) {
    logger.warn({ err: e.message }, "Live ReliefWeb feed unavailable");
  }
}

// ─── Live External Feed 3: NewsAPI Live Articles ─────────────────────────────

async function fetchNewsAPI(useRealDb: boolean) {
  const apiKey = process.env.NEWS_API_KEY;
  if (!apiKey || apiKey === "your_newsapi_key") {
    logger.info("No valid NEWS_API_KEY provided; skipping live news fetch");
    return;
  }

  try {
    const query = encodeURIComponent("crisis OR sanctions OR inflation OR shortage OR war");
    const res: any = await fetch(
      `https://newsapi.org/v2/everything?q=${query}&sortBy=publishedAt&pageSize=15&apiKey=${apiKey}`
    );
    if (!res.ok) {
      logger.warn({ status: res.status }, "NewsAPI response not OK");
      return;
    }
    const data = (await res.json()) as any;
    const articles = data.articles || [];
    let added = 0;

    for (const article of articles) {
      const text = `${article.title || ""} ${article.description || ""}`;
      const lowerText = text.toLowerCase();

      let category: "economic" | "supply_chain" = "economic";
      if (
        lowerText.includes("supply") ||
        lowerText.includes("shipping") ||
        lowerText.includes("port") ||
        lowerText.includes("chip") ||
        lowerText.includes("shortage")
      ) {
        category = "supply_chain";
      }

      const countryInfo = extractCountryFromText(text);
      const country = countryInfo?.country || "Global";
      const lat = countryInfo?.lat ?? (Math.random() - 0.5) * 120;
      const lng = countryInfo?.lng ?? (Math.random() - 0.5) * 300;
      const region = countryInfo?.region || "Global";

      const crisisKeywords = [
        "crisis", "collapse", "recession", "war", "shortage",
        "sanctions", "inflation", "debt", "bankrupt", "catastrophe",
      ];
      const hits = crisisKeywords.filter((kw) => lowerText.includes(kw)).length;
      const baseScore = category === "economic" ? 0.5 : 0.45;
      const score = Math.min(0.95, baseScore + hits * 0.08);
      const level: "Low" | "Medium" | "High" =
        score >= 0.7 ? "High" : score >= 0.4 ? "Medium" : "Low";

      await saveRiskEvent(useRealDb, {
        country,
        region,
        category,
        riskScore: Number(score.toFixed(2)),
        riskLevel: level,
        source: "NewsAPI Live",
        isAnomaly: level === "High",
        lat: Number(lat.toFixed(2)),
        lng: Number(lng.toFixed(2)),
        timestamp: new Date(article.publishedAt || Date.now()),
      });
      added++;

      if (level === "High") {
        await saveAlert(useRealDb, {
          title: (article.title || "Live Alert").substring(0, 120),
          description: (article.description || "Live report").substring(0, 200),
          severity: "High",
          source: "NewsAPI Live",
          country,
        });
      }
    }
    logger.info({ count: added }, "Ingested live NewsAPI crisis reports");
  } catch (e: any) {
    logger.warn({ err: e.message }, "Live NewsAPI fetch error");
  }
}

// ─── Live External Feed 4: OpenWeather Live Feed ─────────────────────────────

async function fetchOpenWeather(useRealDb: boolean) {
  const apiKey = process.env.OPENWEATHER_API_KEY;
  if (!apiKey || apiKey === "your_openweather_key") {
    logger.info("No valid OPENWEATHER_API_KEY provided; skipping live weather fetch");
    return;
  }

  let added = 0;
  for (const city of MAJOR_CITIES) {
    try {
      const res: any = await fetch(
        `https://api.openweathermap.org/data/2.5/weather?lat=${city.lat}&lon=${city.lng}&appid=${apiKey}&units=metric`
      );
      if (!res.ok) continue;
      const data = (await res.json()) as any;

      const windSpeed = data.wind?.speed || 0;
      const weatherMain = data.weather?.[0]?.main || "";
      const isExtreme =
        windSpeed > 15 ||
        weatherMain === "Extreme" ||
        weatherMain === "Tornado" ||
        weatherMain === "Hurricane";

      const climateRisk = isExtreme ? 0.9 : Math.min(0.85, 0.2 + windSpeed / 30);
      const { score, level } = calculateRisk(climateRisk, 0.2, 0.2);

      await saveRiskEvent(useRealDb, {
        country: city.country,
        region: city.region,
        category: "climate",
        riskScore: Number(score.toFixed(2)),
        riskLevel: level,
        source: "OpenWeather Live",
        isAnomaly: isExtreme,
        lat: city.lat,
        lng: city.lng,
        timestamp: new Date(),
      });
      added++;

      if (isExtreme) {
        await saveAlert(useRealDb, {
          title: `Extreme Weather: ${city.name} (${city.country})`,
          description: `Severe conditions: ${data.weather?.[0]?.description || "Storm"}, wind speed ${windSpeed} m/s.`,
          severity: "High",
          source: "OpenWeather Live",
          country: city.country,
        });
      }
    } catch {
      // ignore per-city network timeout
    }
  }
  logger.info({ count: added }, "Ingested live OpenWeather data");
}
