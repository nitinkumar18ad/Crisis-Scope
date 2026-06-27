import { useState, useRef, useCallback, useMemo } from "react";
import { Navbar } from "@/components/layout/Navbar";
import { StatsRow, type StatCardTarget } from "@/components/dashboard/StatsRow";
import { WorldMap } from "@/components/dashboard/WorldMap";
import { RiskChart } from "@/components/dashboard/RiskChart";
import { CrisisSection } from "@/components/dashboard/CrisisSection";
import { CountryPredictionModal } from "@/components/dashboard/CountryPredictionModal";
import { MagicContainer, MagicCard } from "@/components/ui/MagicBento";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useGetRiskData } from "@workspace/api-client-react";
import { Search, X } from "lucide-react";

export default function Dashboard() {
  const [selectedCountry, setSelectedCountry] = useState<string | null>(null);
  const [activeTarget, setActiveTarget] = useState<StatCardTarget | null>(null);
  const [highlightAnomalies, setHighlightAnomalies] = useState(false);
  const [mapHighlight, setMapHighlight] = useState<"highRisk" | null>(null);
  const [countryQuery, setCountryQuery] = useState("");

  const crisisSectionRef = useRef<HTMLDivElement>(null);
  const mapSectionRef = useRef<HTMLDivElement>(null);
  const chartSectionRef = useRef<HTMLDivElement>(null);

  const { data: riskEvents } = useGetRiskData({
    query: { refetchInterval: 30000, queryKey: ["/api/risk/data", "dashboard-search"] },
  });

  const countries = useMemo(() => {
    if (!riskEvents) return [];
    return [...new Set(riskEvents.map((event) => event.country))].sort((a, b) => a.localeCompare(b));
  }, [riskEvents]);

  const normalizedQuery = countryQuery.trim().toLowerCase();
  const matchedCountry = useMemo(() => {
    if (!normalizedQuery) return null;
    return countries.find((country) => country.toLowerCase() === normalizedQuery) ?? null;
  }, [countries, normalizedQuery]);

  const suggestedCountries = useMemo(() => {
    if (!normalizedQuery) return countries.slice(0, 8);
    return countries
      .filter((country) => country.toLowerCase().includes(normalizedQuery))
      .slice(0, 8);
  }, [countries, normalizedQuery]);

  const scrollTo = (ref: React.RefObject<HTMLDivElement | null>) => {
    ref.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const handleCardClick = useCallback((target: StatCardTarget) => {
    // Toggle off if already active
    if (activeTarget === target) {
      setActiveTarget(null);
      setHighlightAnomalies(false);
      setMapHighlight(null);
      return;
    }

    setActiveTarget(target);

    switch (target) {
      case "alerts":
        setHighlightAnomalies(false);
        setMapHighlight(null);
        scrollTo(crisisSectionRef);
        break;
      case "highRisk":
        setHighlightAnomalies(false);
        setMapHighlight("highRisk");
        scrollTo(mapSectionRef);
        break;
      case "avgRisk":
        setHighlightAnomalies(false);
        setMapHighlight(null);
        scrollTo(chartSectionRef);
        break;
      case "anomalies":
        setHighlightAnomalies(true);
        setMapHighlight(null);
        scrollTo(crisisSectionRef);
        break;
    }
  }, [activeTarget]);

  return (
    <div className="min-h-screen bg-background text-foreground selection:bg-primary/30">
      <Navbar />

      <main className="container max-w-[1600px] mx-auto px-4 py-6 space-y-6">
        <MagicContainer className="space-y-6">
        <div className="rounded-xl border border-border bg-card/30 p-4 backdrop-blur-sm">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <div className="text-sm font-semibold uppercase tracking-[0.2em] text-muted-foreground">
                Country Search
              </div>
              <p className="mt-1 text-sm text-muted-foreground">
                Search a country to filter the crisis tables and 30-day trend chart together.
              </p>
            </div>
            <div className="w-full max-w-2xl">
              <div className="flex flex-col gap-2 sm:flex-row">
                <div className="relative flex-1">
                  <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    value={countryQuery}
                    onChange={(event) => setCountryQuery(event.target.value)}
                    list="country-search-options"
                    placeholder="Search by country name, for example India or Brazil"
                    className="pl-9"
                  />
                  <datalist id="country-search-options">
                    {countries.map((country) => (
                      <option key={country} value={country} />
                    ))}
                  </datalist>
                </div>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setCountryQuery("")}
                  disabled={!countryQuery}
                  className="sm:w-auto"
                >
                  <X className="mr-2 h-4 w-4" />
                  Clear
                </Button>
              </div>
              <div className="mt-2 flex flex-wrap gap-2">
                {suggestedCountries.map((country) => (
                  <button
                    key={country}
                    type="button"
                    onClick={() => setCountryQuery(country)}
                    className={`rounded-full border px-3 py-1 text-xs transition-colors ${
                      matchedCountry === country
                        ? "border-primary/50 bg-primary/10 text-primary"
                        : "border-border text-muted-foreground hover:bg-muted/40 hover:text-foreground"
                    }`}
                  >
                    {country}
                  </button>
                ))}
              </div>
              {countryQuery && !matchedCountry && (
                <p className="mt-2 text-xs text-amber-400">
                  No exact country match yet. Pick one of the suggestions to filter the dashboard.
                </p>
              )}
              {matchedCountry && (
                <p className="mt-2 text-xs text-primary">
                  Filtering tables and chart for {matchedCountry}.
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Stats row */}
        <StatsRow onCardClick={handleCardClick} activeTarget={activeTarget} />

        {/* Three crisis sections */}
        <div ref={crisisSectionRef}>
          <SectionDivider label="Crisis Intelligence by Category" />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <MagicCard glowColor="6, 182, 212">
              <CrisisSection
                category="climate"
                onCountrySelect={setSelectedCountry}
                highlightAnomalies={highlightAnomalies}
                highlightHighRisk={activeTarget === "alerts"}
                selectedCountry={matchedCountry ?? undefined}
                className="!border-0 !bg-transparent shadow-none"
              />
            </MagicCard>
            <MagicCard glowColor="245, 158, 11">
              <CrisisSection
                category="economic"
                onCountrySelect={setSelectedCountry}
                highlightAnomalies={highlightAnomalies}
                highlightHighRisk={activeTarget === "alerts"}
                selectedCountry={matchedCountry ?? undefined}
                className="!border-0 !bg-transparent shadow-none"
              />
            </MagicCard>
            <MagicCard glowColor="244, 63, 94">
              <CrisisSection
                category="supply_chain"
                onCountrySelect={setSelectedCountry}
                highlightAnomalies={highlightAnomalies}
                highlightHighRisk={activeTarget === "alerts"}
                selectedCountry={matchedCountry ?? undefined}
                className="!border-0 !bg-transparent shadow-none"
              />
            </MagicCard>
          </div>
        </div>

        {/* Filterable world map */}
        <div ref={mapSectionRef}>
          <SectionDivider label="Global Risk Map" />
          <div className="rounded-xl border border-border bg-card/20 p-1">
            <WorldMap
              onCountrySelect={setSelectedCountry}
              highlightHighRisk={mapHighlight === "highRisk"}
            />
          </div>
        </div>

        {/* Risk history chart */}
        <div ref={chartSectionRef}>
          <SectionDivider
            label={matchedCountry ? `${matchedCountry} Risk Trends` : "30-Day Risk Trends"}
            highlighted={activeTarget === "avgRisk"}
          />
          <MagicCard glowColor="132, 0, 255" enableStars={false} className="p-1">
            <RiskChart
              highlighted={activeTarget === "avgRisk"}
              selectedCountry={matchedCountry ?? undefined}
            />
          </MagicCard>
        </div>

        </MagicContainer>
      </main>

      <CountryPredictionModal
        country={selectedCountry}
        onClose={() => setSelectedCountry(null)}
      />
    </div>
  );
}

function SectionDivider({ label, highlighted }: { label: string; highlighted?: boolean }) {
  return (
    <div className="flex items-center gap-2 mb-4">
      <div className="h-px flex-1 bg-border/50" />
      <span className={`text-[10px] font-mono uppercase tracking-[0.2em] px-3 transition-colors duration-300 ${
        highlighted ? "text-primary" : "text-muted-foreground"
      }`}>
        {label}
      </span>
      <div className="h-px flex-1 bg-border/50" />
    </div>
  );
}
