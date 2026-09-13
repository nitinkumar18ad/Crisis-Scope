import React, { useState, useRef, useCallback, useMemo, Suspense } from "react";
import { Navbar } from "@/components/layout/Navbar";
import { StatsRow, type StatCardTarget } from "@/components/dashboard/StatsRow";
import { RiskChart } from "@/components/dashboard/RiskChart";
import { CrisisSection } from "@/components/dashboard/CrisisSection";
const WorldMap = React.lazy(() => import("@/components/dashboard/WorldMap").then(module => ({ default: module.WorldMap })));
import { CountryPredictionModal } from "@/components/dashboard/CountryPredictionModal";
import { MagicContainer, MagicCard } from "@/components/ui/MagicBento";
import { LightBeamButton } from "@/components/ui/LightBeamButton";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useGetRiskData, type RiskEvent } from "@workspace/api-client-react";
import { Search, X } from "lucide-react";
import { BackgroundVideo } from "@/components/layout/BackgroundVideo";

const heroPosterUrl = "/opengraph.jpg";

export default function Dashboard() {
  const [selectedCountry, setSelectedCountry] = useState<string | null>(null);
  const [activeTarget, setActiveTarget] = useState<StatCardTarget | null>(null);
  const [highlightAnomalies, setHighlightAnomalies] = useState(false);
  const [mapHighlight, setMapHighlight] = useState<"highRisk" | null>(null);
  const [countryQuery, setCountryQuery] = useState("");


  const crisisSectionRef = useRef<HTMLDivElement>(null);
  const mapSectionRef = useRef<HTMLDivElement>(null);
  const chartSectionRef = useRef<HTMLDivElement>(null);


  const riskData = useGetRiskData<RiskEvent[]>({
    query: { refetchInterval: 30000, queryKey: ["/api/risk/data", "dashboard-search"] },
  });
  const riskEvents: RiskEvent[] | undefined = riskData.data;

  const countries = useMemo<string[]>(() => {
    if (!riskEvents) return [];

    return Array.from(new Set(riskEvents.map((event: RiskEvent) => event.country))).sort((a: string, b: string) =>
      a.localeCompare(b),
    );
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
    <div className="relative min-h-screen w-full overflow-x-clip text-foreground selection:bg-primary/30">
      <div className="relative z-10">
        <Navbar />

        {/* Hero Section */}
        <section className="hero-section relative overflow-hidden">
          <BackgroundVideo
            src="https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260319_055001_8e16d972-3b2b-441c-86ad-2901a54682f9.mp4"
            overlayClassName="hero-video-overlay"
          />

          <div className="hero-content relative flex flex-col items-center justify-center px-4 py-16 text-center sm:py-20 md:py-28">
            <div
              className="absolute inset-0 z-0 pointer-events-none from-primary/10 via-background/70 to-background"
              style={{ background: "radial-gradient(circle at center, var(--tw-gradient-stops))" }}
            />
            <div className="absolute inset-0 z-0 pointer-events-none bg-animated-grid opacity-30" />

            <div className="relative z-10 mx-auto flex w-full max-w-4xl flex-col items-center gap-5 sm:gap-6">
              <div className="hero-badge inline-flex items-center gap-2 rounded-full border border-red-400/20 bg-white/5 px-3 py-1.5 text-xs font-semibold text-red-100 backdrop-blur-md sm:text-sm animate-hero-fade-up" style={{ animationDelay: "80ms" }}>
                <div className="hero-badge-dot h-2 w-2 shrink-0 rounded-full bg-red-400 animate-pulse-dot" />
                AI-Powered Global Threat Intelligence
              </div>

              <h1 className="hero-title px-2 text-5xl font-extrabold leading-none tracking-tight text-transparent bg-clip-text bg-linear-to-r from-white via-slate-100 to-cyan-300 sm:text-6xl lg:text-7xl animate-hero-fade-up" style={{ animationDelay: "160ms" }}>
                Know Upcoming Crises
                <br />
                Before They Happen
              </h1>

              <p className="hero-subtitle w-full px-2 text-lg leading-relaxed text-slate-300/90 sm:text-xl animate-hero-fade-up" style={{ animationDelay: "240ms" }}>
                Monitor climate, geopolitical, economic, and supply chain risks in real time with AI-powered forecasting, interactive analytics, and actionable insights.
              </p>

              <LightBeamButton
                className="hero-cta mt-2 px-6 sm:px-8 py-3 text-sm sm:text-base transition-all duration-300 animate-hero-fade-up"
                style={{ animationDelay: "320ms" }}
                onClick={() => scrollTo(crisisSectionRef)}
              >
                Explore Live Intelligence
              </LightBeamButton>
            </div>
          </div>
        </section>

        <main className="container w-full mx-auto px-3 sm:px-4 py-4 sm:py-6 space-y-4 sm:space-y-6" style={{ maxWidth: "1600px" }}>
          <MagicContainer className="space-y-6">
            <div className="group rounded-xl border border-cyan-300/20 bg-linear-to-r from-cyan-400/10 via-blue-500/10 to-violet-500/10 p-4 shadow-[0_0_28px_rgba(56,189,248,0.10)] backdrop-blur-md transition-all duration-300 hover:border-cyan-300/35 hover:shadow-[0_0_36px_rgba(56,189,248,0.16)]">
              <div className="flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
                <div>
                  <div className="text-base font-semibold uppercase text-cyan-100 transition-colors duration-300 group-hover:text-white" style={{ letterSpacing: "0.2em" }}>
                    Country Search
                  </div>
                  <p className="mt-1 text-sm text-cyan-100/75 transition-colors duration-300 group-hover:text-cyan-50/90">
                    Search a country to filter the crisis tables and 30-day trend chart together.
                  </p>
                </div>
                <div className="w-full max-w-2xl">
                  <div className="flex flex-col gap-2 sm:flex-row">
                    <div className="relative flex-1">
                      <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-cyan-100/70" />
                      <Input
                        id="country-search-input"
                        name="country-search"
                        value={countryQuery}
                        onChange={(event) => setCountryQuery(event.target.value)}
                        list="country-search-options"
                        placeholder="Search by country name, for example India or Brazil"
                        className="pl-9 border-cyan-300/20 bg-slate-950/40 text-slate-100 placeholder:text-slate-400 transition-all duration-300 focus-visible:border-cyan-300/50 focus-visible:ring-2 focus-visible:ring-cyan-300/20"
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
                      className="sm:w-auto border-cyan-300/20 bg-white/5 text-cyan-100 transition-all duration-300 hover:border-cyan-300/40 hover:bg-cyan-400/10 hover:text-white"
                    >
                      <X className="mr-2 h-4 w-4" />
                      Clear
                    </Button>
                  </div>
                  <div className="mt-2 flex flex-wrap gap-1.5 sm:gap-2">
                    {suggestedCountries.map((country) => (
                      <button
                        key={country}
                        type="button"
                        onClick={() => setCountryQuery(country)}
                        style={{ touchAction: 'manipulation' }}
                        className={`rounded-full border px-2 py-0.5 text-xs transition-all duration-300 hover:-translate-y-0.5 hover:border-cyan-300/40 hover:bg-cyan-400/10 hover:text-white sm:px-3 sm:py-1 ${matchedCountry === country
                          ? "border-cyan-300/50 bg-cyan-400/15 text-cyan-50 shadow-[0_0_18px_rgba(56,189,248,0.15)]"
                          : "border-cyan-300/20 bg-white/5 text-cyan-100/70 hover:bg-cyan-400/10 hover:text-white"
                          }`}
                      >
                        {country}
                      </button>
                    ))}
                  </div>
                  {countryQuery && !matchedCountry && (
                    <p className="mt-2 text-xs text-amber-300">
                      No exact country match yet. Pick one of the suggestions to filter the dashboard.
                    </p>
                  )}
                  {matchedCountry && (
                    <p className="mt-2 text-xs text-cyan-100">
                      Filtering tables and chart for {matchedCountry}.
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Stats row */}
            <StatsRow onCardClick={handleCardClick} activeTarget={activeTarget} />

            {/* Three crisis sections */}
            <div id="crisis-intelligence" ref={crisisSectionRef}>
              <SectionDivider label="Crisis Intelligence by Category" />
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <MagicCard glowColor="34, 211, 238" className="border border-cyan-500/30 bg-cyan-950/20 shadow-[0_0_24px_rgba(34,211,238,0.10)] transition-all duration-300 hover:border-cyan-400/50 hover:shadow-[0_0_32px_rgba(34,211,238,0.18)]">
                  <CrisisSection
                    category="climate"
                    onCountrySelect={setSelectedCountry}
                    highlightAnomalies={highlightAnomalies}
                    highlightHighRisk={activeTarget === "alerts"}
                    selectedCountry={matchedCountry ?? undefined}
                    className="border-none bg-transparent shadow-none"
                  />
                </MagicCard>
                <MagicCard glowColor="245, 158, 11" className="border border-amber-500/30 bg-amber-950/20 shadow-[0_0_24px_rgba(245,158,11,0.10)] transition-all duration-300 hover:border-amber-400/50 hover:shadow-[0_0_32px_rgba(245,158,11,0.18)]">
                  <CrisisSection
                    category="economic"
                    onCountrySelect={setSelectedCountry}
                    highlightAnomalies={highlightAnomalies}
                    highlightHighRisk={activeTarget === "alerts"}
                    selectedCountry={matchedCountry ?? undefined}
                    className="border-none bg-transparent shadow-none"
                  />
                </MagicCard>
                <MagicCard glowColor="244, 63, 94" className="border border-rose-500/30 bg-rose-950/20 shadow-[0_0_24px_rgba(244,63,94,0.10)] transition-all duration-300 hover:border-rose-400/50 hover:shadow-[0_0_32px_rgba(244,63,94,0.18)]">
                  <CrisisSection
                    category="supply_chain"
                    onCountrySelect={setSelectedCountry}
                    highlightAnomalies={highlightAnomalies}
                    highlightHighRisk={activeTarget === "alerts"}
                    selectedCountry={matchedCountry ?? undefined}
                    className="border-none bg-transparent shadow-none"
                  />
                </MagicCard>
              </div>
            </div>

            {/* Filterable world map */}
            <div id="global-risk-map" ref={mapSectionRef}>
              <SectionDivider label="Global Risk Map" />
              <Suspense fallback={<div className="h-80 lg:h-105 flex items-center justify-center bg-background/50 text-muted-foreground text-sm">Loading 3D Globe...</div>}>
                <WorldMap
                  onCountrySelect={setSelectedCountry}
                  highlightHighRisk={mapHighlight === "highRisk"}
                />
              </Suspense>
            </div>

            {/* Risk history chart */}
            <div id="risk-trends" ref={chartSectionRef}>
              <SectionDivider
                label={matchedCountry ? `${matchedCountry} Risk Trends` : "30-Day Risk Trends"}
                highlighted={activeTarget === "avgRisk"}
              />
              <MagicCard
                glowColor="56, 189, 248"
                enableStars={false}
                className="p-1 border border-cyan-300/20 bg-linear-to-r from-cyan-400/10 via-blue-500/10 to-violet-500/10 shadow-[0_0_28px_rgba(56,189,248,0.10)] backdrop-blur-md transition-all duration-300 hover:border-cyan-300/35 hover:shadow-[0_0_36px_rgba(56,189,248,0.16)]"
              >
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
    </div>
  );
}

function SectionDivider({ label, highlighted }: { label: string; highlighted?: boolean }) {
  return (
    <div className="flex items-center gap-2 mb-4">
      <div className="h-px flex-1 bg-border/50" />
      <span className="text-xs sm:text-sm font-mono uppercase px-3 transition-colors duration-300" style={{ letterSpacing: "0.2em" }}>
        <span className={highlighted ? "text-primary" : "text-muted-foreground"}>
          {label}
        </span>
      </span>
      <div className="h-px flex-1 bg-border/50" />
    </div>
  );
}
