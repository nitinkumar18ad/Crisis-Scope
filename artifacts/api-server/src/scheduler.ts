import { db, riskEventsTable, alertsTable } from "@workspace/db";
import { logger } from "./lib/logger";

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

// Country keyword map for NLP-style extraction from news text
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

// Diverse seed data for populating economic and supply chain categories
const SEED_ECONOMIC_DATA = [
  { country: "USA", lat: 38.9, lng: -77.0, region: "North America", score: 0.55, note: "Market volatility" },
  { country: "Germany", lat: 51.16, lng: 10.45, region: "Europe", score: 0.62, note: "Debt concerns" },
  { country: "China", lat: 35.86, lng: 104.19, region: "Asia", score: 0.71, note: "Property sector stress" },
  { country: "Argentina", lat: -38.41, lng: -63.61, region: "South America", score: 0.85, note: "Hyperinflation" },
  { country: "Turkey", lat: 38.96, lng: 35.24, region: "Middle East", score: 0.78, note: "Currency devaluation" },
  { country: "UK", lat: 55.38, lng: -3.44, region: "Europe", score: 0.48, note: "Post-Brexit challenges" },
  { country: "Japan", lat: 36.20, lng: 138.25, region: "Asia", score: 0.44, note: "Low growth concerns" },
  { country: "Brazil", lat: -14.24, lng: -51.93, region: "South America", score: 0.60, note: "Fiscal deficit" },
  { country: "India", lat: 20.59, lng: 78.96, region: "Asia", score: 0.42, note: "Inflation pressure" },
  { country: "Nigeria", lat: 9.08, lng: 8.67, region: "Africa", score: 0.76, note: "Oil revenue drop" },
  { country: "Pakistan", lat: 30.37, lng: 69.34, region: "Asia", score: 0.82, note: "IMF bailout needed" },
  { country: "South Africa", lat: -30.56, lng: 22.94, region: "Africa", score: 0.65, note: "Unemployment crisis" },
  { country: "Russia", lat: 61.52, lng: 105.31, region: "Europe", score: 0.73, note: "Sanctions impact" },
  { country: "Mexico", lat: 23.63, lng: -102.55, region: "North America", score: 0.51, note: "Trade uncertainty" },
  { country: "Egypt", lat: 26.82, lng: 30.80, region: "Middle East", score: 0.69, note: "Foreign debt burden" },
];

const SEED_SUPPLY_CHAIN_DATA = [
  { country: "China", lat: 35.86, lng: 104.19, region: "Asia", score: 0.68, note: "Factory output decline" },
  { country: "USA", lat: 38.9, lng: -77.0, region: "North America", score: 0.52, note: "Port congestion" },
  { country: "Germany", lat: 51.16, lng: 10.45, region: "Europe", score: 0.57, note: "Auto parts shortage" },
  { country: "Japan", lat: 36.20, lng: 138.25, region: "Asia", score: 0.49, note: "Semiconductor crunch" },
  { country: "South Korea", lat: 35.91, lng: 127.77, region: "Asia", score: 0.53, note: "Chip export controls" },
  { country: "Taiwan", lat: 23.69, lng: 120.96, region: "Asia", score: 0.64, note: "Geopolitical risk" },
  { country: "India", lat: 20.59, lng: 78.96, region: "Asia", score: 0.46, note: "Logistics bottlenecks" },
  { country: "UK", lat: 55.38, lng: -3.44, region: "Europe", score: 0.55, note: "Driver shortages" },
  { country: "Netherlands", lat: 52.13, lng: 5.29, region: "Europe", score: 0.43, note: "Rotterdam delays" },
  { country: "Australia", lat: -25.27, lng: 133.78, region: "Oceania", score: 0.40, note: "Commodity export stress" },
  { country: "Vietnam", lat: 14.06, lng: 108.28, region: "Asia", score: 0.59, note: "Manufacturing shift issues" },
  { country: "Mexico", lat: 23.63, lng: -102.55, region: "North America", score: 0.48, note: "Nearshoring strain" },
  { country: "Brazil", lat: -14.24, lng: -51.93, region: "South America", score: 0.56, note: "Agri-supply disruption" },
  { country: "Saudi Arabia", lat: 23.88, lng: 45.08, region: "Middle East", score: 0.62, note: "Oil logistics stress" },
  { country: "Singapore", lat: 1.35, lng: 103.82, region: "Asia", score: 0.38, note: "Hub capacity issues" },
];

export function startScheduler() {
  const INTERVAL = 30 * 60 * 1000; // 30 minutes
  setInterval(async () => {
    try {
      await runBackgroundJobs();
    } catch (e) {
      logger.error({ err: e }, "Scheduler interval error");
    }
  }, INTERVAL);

  // Run initial job after 5 seconds to allow server to start
  setTimeout(() => {
    runBackgroundJobs().catch((e) => logger.error({ err: e }, "Initial scheduler error"));
  }, 5000);
}

async function runBackgroundJobs() {
  logger.info("Starting background data fetch jobs...");
  await Promise.allSettled([
    seedHistoricalData(),
    seedEconomicAndSupplyChainData(),
    fetchReliefWeb(),
    fetchUSGS(),
    fetchNewsAPI(),
    fetchOpenWeather(),
  ]);
  logger.info("Background data fetch jobs completed.");
}

async function seedHistoricalData() {
  const countRes = await db.select().from(riskEventsTable);
  const hasOldData = countRes.some(e => {
    const diff = Date.now() - e.timestamp.getTime();
    return diff > 24 * 60 * 60 * 1000;
  });

  if (!hasOldData) {
    logger.info("Seeding 30 days of historical data for trend chart...");
    const now = new Date();
    for (let i = 30; i >= 1; i--) {
      const pastDate = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
      
      const climateScore = 0.3 + Math.random() * 0.3 + (Math.sin(i / 5) * 0.1);
      const economicScore = 0.4 + Math.random() * 0.2 + (Math.cos(i / 7) * 0.15);
      const supplyScore = 0.5 + Math.random() * 0.2 + (Math.sin(i / 4) * 0.1);
      
      await db.insert(riskEventsTable).values([
        {
          country: "Global", region: "Global", category: "climate",
          riskScore: climateScore, riskLevel: climateScore >= 0.7 ? "High" : climateScore >= 0.4 ? "Medium" : "Low",
          source: "HistoricalSeed", isAnomaly: false, lat: 0, lng: 0,
          timestamp: pastDate
        },
        {
          country: "Global", region: "Global", category: "economic",
          riskScore: economicScore, riskLevel: economicScore >= 0.7 ? "High" : economicScore >= 0.4 ? "Medium" : "Low",
          source: "HistoricalSeed", isAnomaly: false, lat: 0, lng: 0,
          timestamp: pastDate
        },
        {
          country: "Global", region: "Global", category: "supply_chain",
          riskScore: supplyScore, riskLevel: supplyScore >= 0.7 ? "High" : supplyScore >= 0.4 ? "Medium" : "Low",
          source: "HistoricalSeed", isAnomaly: false, lat: 0, lng: 0,
          timestamp: pastDate
        }
      ]);
    }
    logger.info("Historical data seeded.");
  }
}

function calculateRisk(climate: number, economic: number, supplyChain: number) {
  const score = (climate * 0.35) + (economic * 0.40) + (supplyChain * 0.25);
  let level: "Low" | "Medium" | "High" = "Low";
  if (score >= 0.7) level = "High";
  else if (score >= 0.4) level = "Medium";
  return { score, level };
}

async function seedEconomicAndSupplyChainData() {
  logger.info("Seeding economic and supply chain data...");
  try {
    // Seed economic data — use raw score directly so high-risk countries appear as High
    for (const item of SEED_ECONOMIC_DATA) {
      const riskScore = item.score;
      const riskLevel: "Low" | "Medium" | "High" = riskScore >= 0.7 ? "High" : riskScore >= 0.4 ? "Medium" : "Low";
      const isHigh = riskLevel === "High";

      await db.insert(riskEventsTable).values({
        country: item.country,
        region: item.region,
        category: "economic",
        riskScore,
        riskLevel,
        source: "EconomicModel",
        isAnomaly: riskScore >= 0.75,
        lat: item.lat,
        lng: item.lng,
      });

      if (isHigh) {
        await db.insert(alertsTable).values({
          title: `Economic Crisis: ${item.country}`,
          description: `Critical economic risk detected in ${item.country}. ${item.note}. Risk score: ${(riskScore * 100).toFixed(0)}%.`,
          severity: "High",
          source: "EconomicModel",
          country: item.country,
        });
      }
    }

    // Seed supply chain data — use raw score directly
    for (const item of SEED_SUPPLY_CHAIN_DATA) {
      const riskScore = item.score;
      const riskLevel: "Low" | "Medium" | "High" = riskScore >= 0.7 ? "High" : riskScore >= 0.4 ? "Medium" : "Low";
      const isHigh = riskLevel === "High";

      await db.insert(riskEventsTable).values({
        country: item.country,
        region: item.region,
        category: "supply_chain",
        riskScore,
        riskLevel,
        source: "SupplyChainModel",
        isAnomaly: riskScore >= 0.65,
        lat: item.lat,
        lng: item.lng,
      });

      if (isHigh) {
        await db.insert(alertsTable).values({
          title: `Supply Chain Crisis: ${item.country}`,
          description: `Critical supply chain disruption in ${item.country}. ${item.note}. Risk score: ${(riskScore * 100).toFixed(0)}%.`,
          severity: "High",
          source: "SupplyChainModel",
          country: item.country,
        });
      }
    }
    logger.info("Seeding completed successfully.");
  } catch (e) {
    logger.error({ err: e }, "Failed to seed economic/supply chain data");
  }
}

async function fetchReliefWeb() {
  try {
    const res = await fetch("https://api.reliefweb.int/v1/reports?appname=globalcrisis&limit=10&profile=full");
    if (!res.ok) return;
    const data = await res.json() as any;
    for (const item of data.data || []) {
      const country = item.fields?.primary_country?.name || "Unknown";
      const title = item.fields?.title || "ReliefWeb Report";
      
      const { score, level } = calculateRisk(0.8, 0.4, 0.6); // Humanitarian crisis assumes high climate/impact

      await db.insert(riskEventsTable).values({
        country,
        region: "Global",
        category: "climate",
        riskScore: score,
        riskLevel: level,
        source: "ReliefWeb",
        isAnomaly: level === "High",
        lat: item.fields?.primary_country?.location?.lat || 0,
        lng: item.fields?.primary_country?.location?.lon || 0,
      }).onConflictDoNothing();

      if (level === "High") {
        await db.insert(alertsTable).values({
          title: `Humanitarian Crisis: ${country}`,
          description: title,
          severity: "High",
          source: "ReliefWeb",
          country,
        }).onConflictDoNothing();
      }
    }
  } catch (e) {
    logger.error({ err: e }, "Failed to fetch ReliefWeb");
  }
}

async function fetchUSGS() {
  try {
    const res = await fetch("https://earthquake.usgs.gov/fdsnws/event/1/query?format=geojson&minmagnitude=5.0&limit=10");
    if (!res.ok) return;
    const data = await res.json() as any;
    for (const feature of data.features || []) {
      const mag = feature.properties.mag;
      const place = feature.properties.place;
      const [lng, lat] = feature.geometry.coordinates;
      
      const climateRisk = Math.min(1.0, mag / 8.0);
      const { score, level } = calculateRisk(climateRisk, 0.2, 0.3);
      
      const countryMatch = place.split(", ").pop() || "Unknown";
      
      await db.insert(riskEventsTable).values({
        country: countryMatch,
        region: "Global",
        category: "climate",
        riskScore: score,
        riskLevel: level,
        source: "USGS",
        isAnomaly: mag >= 6.5,
        lat,
        lng,
      });

      if (mag >= 6.5) {
        await db.insert(alertsTable).values({
          title: `Major Earthquake: Magnitude ${mag}`,
          description: `A magnitude ${mag} earthquake occurred at ${place}`,
          severity: "High",
          source: "USGS",
          country: countryMatch,
        });
      }
    }
  } catch (e) {
    logger.error({ err: e }, "Failed to fetch USGS");
  }
}

async function fetchNewsAPI() {
  const apiKey = process.env.NEWS_API_KEY;
  let articles: any[] = [];

  if (!apiKey || apiKey === "your_newsapi_key") {
    logger.warn("NEWS_API_KEY is not set or invalid. Using mock data for NewsAPI.");
    articles = getMockNewsArticles();
  } else {
    try {
      const query = encodeURIComponent("war OR economic instability OR supply chain disruption OR inflation OR recession");
      const res = await fetch(`https://newsapi.org/v2/everything?q=${query}&sortBy=publishedAt&pageSize=20&apiKey=${apiKey}`);
      if (!res.ok) {
        logger.warn("NewsAPI returned an error. Using mock data instead.");
        articles = getMockNewsArticles();
      } else {
        const data = await res.json() as any;
        articles = data.articles || [];
      }
    } catch (e) {
      logger.error({ err: e }, "Failed to fetch NewsAPI");
      return;
    }
  }
  
  try {
    for (const article of articles) {
      const text = `${article.title || ""} ${article.description || ""}`;
      const lowerText = text.toLowerCase();

      let category: "economic" | "supply_chain" = "economic";
      if (lowerText.includes("supply") || lowerText.includes("logistics") || lowerText.includes("shortage") || lowerText.includes("shipping") || lowerText.includes("port") || lowerText.includes("semiconductor") || lowerText.includes("chip")) {
        category = "supply_chain";
      }

      // Try to extract a country from the article text
      const countryInfo = extractCountryFromText(text);
      const country = countryInfo?.country || "Global";
      const lat = countryInfo?.lat ?? ((Math.random() - 0.5) * 140);
      const lng = countryInfo?.lng ?? ((Math.random() - 0.5) * 340);
      const region = countryInfo?.region || "Global";

      // Score based on crisis keyword density for realistic, relevant-only alerts
      const crisisKeywords = ["crisis", "collapse", "recession", "war", "conflict", "shortage", "disruption", "sanctions", "inflation", "debt", "default", "strike", "bankrupt", "devastat", "catastroph", "critical"];
      const keywordHits = crisisKeywords.filter(kw => lowerText.includes(kw)).length;
      const baseScore = category === "economic" ? 0.45 : 0.42;
      const score = Math.min(0.95, baseScore + (keywordHits * 0.08) + (Math.random() * 0.1));
      const level: "Low" | "Medium" | "High" = score >= 0.7 ? "High" : score >= 0.4 ? "Medium" : "Low";
      
      await db.insert(riskEventsTable).values({
        country,
        region,
        category,
        riskScore: score,
        riskLevel: level,
        source: "NewsAPI",
        isAnomaly: level === "High",
        lat,
        lng,
      }).onConflictDoNothing();

      if (level === "High") {
        await db.insert(alertsTable).values({
          title: `Alert: ${(article.title || "Crisis event").substring(0, 100)}`,
          description: article.description || "No description provided.",
          severity: "High",
          source: "NewsAPI",
          country,
        }).onConflictDoNothing();
      }
    }
  } catch (e) {
    logger.error({ err: e }, "Failed to insert NewsAPI data");
  }
}

function getMockNewsArticles() {
  return [
    { title: "Germany faces economic slowdown amid energy crisis", description: "Germany's industrial output declines as energy costs soar across Europe." },
    { title: "China economic growth misses targets", description: "China's GDP growth falls below government targets amid property market turmoil." },
    { title: "Argentina inflation hits record high", description: "Argentina's economy faces hyperinflation as peso loses value rapidly." },
    { title: "Turkey currency crisis deepens economic instability", description: "Turkish lira hits all-time low as inflation crisis continues." },
    { title: "Pakistan seeks IMF bailout amid debt crisis", description: "Pakistan faces economic meltdown as foreign reserves hit critical levels." },
    { title: "Nigeria oil sector faces economic contraction", description: "Africa's largest economy shrinks as oil production falls and currency weakens." },
    { title: "South America supply chain disruptions hit Brazil exports", description: "Brazil faces logistics bottlenecks affecting agricultural commodity exports." },
    { title: "Taiwan semiconductor shortage impacts global supply chain", description: "Chip shortage originating from Taiwan disrupts global manufacturing." },
    { title: "South Korea chip export controls strain supply chain", description: "South Korea's semiconductor restrictions ripple through global tech supply chains." },
    { title: "Vietnam manufacturing shift creates supply chain uncertainty", description: "Vietnam's rapid factory expansion creates new supply chain vulnerabilities." },
    { title: "Netherlands Rotterdam port faces shipping delays", description: "Europe's busiest port faces record backlogs disrupting supply chains." },
    { title: "Russia sanctions impact global supply chains and economy", description: "Western sanctions on Russia create ripple effects across global trade networks." },
    { title: "Middle East tensions raise oil supply chain concerns", description: "Escalating tensions threaten critical oil shipping routes through the region." },
    { title: "India inflation pressures mount amid supply chain stress", description: "India faces rising consumer prices as supply disruptions continue." },
    { title: "Mexico nearshoring push strains supply chain infrastructure", description: "Rapid manufacturing shift to Mexico reveals infrastructure gaps." },
  ];
}

async function fetchOpenWeather() {
  const apiKey = process.env.OPENWEATHER_API_KEY;
  if (!apiKey) {
    logger.warn("OPENWEATHER_API_KEY is not set. Skipping OpenWeather.");
    return;
  }

  for (const city of MAJOR_CITIES) {
    try {
      const res = await fetch(`https://api.openweathermap.org/data/2.5/weather?lat=${city.lat}&lon=${city.lng}&appid=${apiKey}&units=metric`);
      if (!res.ok) continue;
      const data = await res.json() as any;
      
      const windSpeed = data.wind?.speed || 0;
      const weatherMain = data.weather?.[0]?.main || "";
      const isExtreme = windSpeed > 15 || weatherMain === 'Extreme' || weatherMain === 'Tornado' || weatherMain === 'Hurricane';
      
      const climateRisk = isExtreme ? 0.9 : Math.min(0.8, 0.2 + (windSpeed / 30));
      const { score, level } = calculateRisk(climateRisk, 0.2, 0.2);

      await db.insert(riskEventsTable).values({
        country: city.country,
        region: city.region,
        category: "climate",
        riskScore: score,
        riskLevel: level,
        source: "OpenWeather",
        isAnomaly: isExtreme,
        lat: city.lat,
        lng: city.lng,
      }).onConflictDoNothing();

      if (isExtreme) {
        await db.insert(alertsTable).values({
          title: `Extreme Weather Alert in ${city.name}`,
          description: `Extreme weather conditions detected. Wind speed: ${windSpeed}m/s. Conditions: ${data.weather?.[0]?.description || "severe"}`,
          severity: "High",
          source: "OpenWeather",
          country: city.country,
        }).onConflictDoNothing();
      }

    } catch (e) {
      logger.error({ err: e }, `Failed to fetch OpenWeather for ${city.name}`);
    }
  }
}
