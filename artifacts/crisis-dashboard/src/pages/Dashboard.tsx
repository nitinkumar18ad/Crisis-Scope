import { useState, useRef, useCallback } from "react";
import { Navbar } from "@/components/layout/Navbar";
import { StatsRow, type StatCardTarget } from "@/components/dashboard/StatsRow";
import { WorldMap } from "@/components/dashboard/WorldMap";
import { RiskChart } from "@/components/dashboard/RiskChart";
import { CrisisSection } from "@/components/dashboard/CrisisSection";
import { CountryPredictionModal } from "@/components/dashboard/CountryPredictionModal";
import { MagicContainer, MagicCard } from "@/components/ui/MagicBento";

export default function Dashboard() {
  const [selectedCountry, setSelectedCountry] = useState<string | null>(null);
  const [activeTarget, setActiveTarget] = useState<StatCardTarget | null>(null);
  const [highlightAnomalies, setHighlightAnomalies] = useState(false);
  const [mapHighlight, setMapHighlight] = useState<"highRisk" | null>(null);

  const crisisSectionRef = useRef<HTMLDivElement>(null);
  const mapSectionRef = useRef<HTMLDivElement>(null);
  const chartSectionRef = useRef<HTMLDivElement>(null);

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
                className="!border-0 !bg-transparent shadow-none"
              />
            </MagicCard>
            <MagicCard glowColor="245, 158, 11">
              <CrisisSection
                category="economic"
                onCountrySelect={setSelectedCountry}
                highlightAnomalies={highlightAnomalies}
                highlightHighRisk={activeTarget === "alerts"}
                className="!border-0 !bg-transparent shadow-none"
              />
            </MagicCard>
            <MagicCard glowColor="244, 63, 94">
              <CrisisSection
                category="supply_chain"
                onCountrySelect={setSelectedCountry}
                highlightAnomalies={highlightAnomalies}
                highlightHighRisk={activeTarget === "alerts"}
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
            label="30-Day Risk Trends"
            highlighted={activeTarget === "avgRisk"}
          />
          <MagicCard glowColor="132, 0, 255" enableStars={false} className="p-1">
            <RiskChart highlighted={activeTarget === "avgRisk"} />
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
