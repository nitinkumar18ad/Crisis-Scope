import { logger } from "./lib/logger";

// ─── Types ───────────────────────────────────────────────────────────────────

type Category = "climate" | "economic" | "supply_chain";
type RiskLevel = "Low" | "Medium" | "High";

export interface MockRiskEvent {
  id: number;
  country: string;
  region: string;
  category: Category;
  riskScore: number;
  riskLevel: RiskLevel;
  source: string;
  timestamp: Date;
  isAnomaly: boolean;
  lat: number;
  lng: number;
}

export interface MockAlert {
  id: number;
  title: string;
  description: string;
  severity: string;
  source: string;
  country: string;
  createdAt: Date;
}

// ─── In-memory store ─────────────────────────────────────────────────────────

let _riskEvents: MockRiskEvent[] = [];
let _alerts: MockAlert[] = [];
let _nextEventId = 1;
let _nextAlertId = 1;

function rl(score: number): RiskLevel {
  return score >= 0.7 ? "High" : score >= 0.4 ? "Medium" : "Low";
}

function pastDate(daysAgo: number): Date {
  return new Date(Date.now() - daysAgo * 24 * 60 * 60 * 1000);
}

function seedMockData() {
  const now = new Date();

  // ── 30 days of historical data ──────────────────────────────────────
  for (let i = 30; i >= 1; i--) {
    const d = pastDate(i);
    const cs = 0.3 + Math.random() * 0.3 + Math.sin(i / 5) * 0.1;
    const es = 0.4 + Math.random() * 0.2 + Math.cos(i / 7) * 0.15;
    const ss = 0.5 + Math.random() * 0.2 + Math.sin(i / 4) * 0.1;

    for (const [cat, score] of [["climate", cs], ["economic", es], ["supply_chain", ss]] as [Category, number][]) {
      _riskEvents.push({ id: _nextEventId++, country: "Global", region: "Global", category: cat, riskScore: score, riskLevel: rl(score), source: "HistoricalSeed", timestamp: d, isAnomaly: false, lat: 0, lng: 0 });
    }
  }

  // ── Economic seed data ───────────────────────────────────────────────
  const economic = [
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

  for (const item of economic) {
    _riskEvents.push({ id: _nextEventId++, country: item.country, region: item.region, category: "economic", riskScore: item.score, riskLevel: rl(item.score), source: "EconomicModel", timestamp: now, isAnomaly: item.score >= 0.75, lat: item.lat, lng: item.lng });
    if (item.score >= 0.7) {
      _alerts.push({ id: _nextAlertId++, title: `Economic Crisis: ${item.country}`, description: `Critical economic risk. ${item.note}. Risk score: ${(item.score * 100).toFixed(0)}%.`, severity: "High", source: "EconomicModel", country: item.country, createdAt: now });
    }
  }

  // ── Supply chain seed data ───────────────────────────────────────────
  const supply = [
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

  for (const item of supply) {
    _riskEvents.push({ id: _nextEventId++, country: item.country, region: item.region, category: "supply_chain", riskScore: item.score, riskLevel: rl(item.score), source: "SupplyChainModel", timestamp: now, isAnomaly: item.score >= 0.65, lat: item.lat, lng: item.lng });
    if (item.score >= 0.7) {
      _alerts.push({ id: _nextAlertId++, title: `Supply Chain Crisis: ${item.country}`, description: `Critical supply chain disruption. ${item.note}. Risk score: ${(item.score * 100).toFixed(0)}%.`, severity: "High", source: "SupplyChainModel", country: item.country, createdAt: now });
    }
  }

  // ── Climate / humanitarian seed data ────────────────────────────────
  const climate = [
    { country: "Bangladesh", lat: 23.68, lng: 90.35, region: "Asia", score: 0.82, note: "Severe flooding" },
    { country: "Somalia", lat: 5.15, lng: 46.20, region: "Africa", score: 0.88, note: "Drought crisis" },
    { country: "Philippines", lat: 12.88, lng: 121.77, region: "Asia", score: 0.74, note: "Typhoon damage" },
    { country: "Ethiopia", lat: 9.14, lng: 40.49, region: "Africa", score: 0.79, note: "Food insecurity" },
    { country: "Indonesia", lat: -0.79, lng: 113.92, region: "Asia", score: 0.63, note: "Volcanic activity" },
    { country: "Chile", lat: -35.67, lng: -71.54, region: "South America", score: 0.55, note: "Wildfire season" },
    { country: "Canada", lat: 56.13, lng: -106.35, region: "North America", score: 0.48, note: "Forest fires" },
    { country: "Spain", lat: 40.46, lng: -3.75, region: "Europe", score: 0.44, note: "Drought conditions" },
    { country: "Iran", lat: 32.42, lng: 53.68, region: "Middle East", score: 0.67, note: "Water crisis" },
    { country: "Ukraine", lat: 48.37, lng: 31.16, region: "Europe", score: 0.91, note: "Conflict-driven crisis" },
  ];

  for (const item of climate) {
    _riskEvents.push({ id: _nextEventId++, country: item.country, region: item.region, category: "climate", riskScore: item.score, riskLevel: rl(item.score), source: "ClimateModel", timestamp: now, isAnomaly: item.score >= 0.75, lat: item.lat, lng: item.lng });
    if (item.score >= 0.7) {
      _alerts.push({ id: _nextAlertId++, title: `Climate Alert: ${item.country}`, description: `${item.note} in ${item.country}. Risk score: ${(item.score * 100).toFixed(0)}%.`, severity: "High", source: "ClimateModel", country: item.country, createdAt: now });
    }
  }

  logger.info({ events: _riskEvents.length, alerts: _alerts.length }, "Mock in-memory DB seeded");
}

// ─── Mock DB interface ────────────────────────────────────────────────────────

export const mockDb = {
  getRiskEvents(): MockRiskEvent[] {
    return [..._riskEvents];
  },
  getAlerts(): MockAlert[] {
    return [..._alerts];
  },
  insertRiskEvent(data: Omit<MockRiskEvent, "id" | "timestamp"> & { timestamp?: Date }): MockRiskEvent {
    const event: MockRiskEvent = { id: _nextEventId++, timestamp: data.timestamp ?? new Date(), ...data };
    _riskEvents.push(event);
    return event;
  },
  insertAlert(data: Omit<MockAlert, "id" | "createdAt">): MockAlert {
    const alert: MockAlert = { id: _nextAlertId++, createdAt: new Date(), ...data };
    _alerts.push(alert);
    return alert;
  },
  clear() {
    _riskEvents = [];
    _alerts = [];
    _nextEventId = 1;
    _nextAlertId = 1;
  },
};

// ─── Initialise ───────────────────────────────────────────────────────────────

seedMockData();

