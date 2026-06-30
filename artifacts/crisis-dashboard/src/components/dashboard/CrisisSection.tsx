import React, { useMemo } from "react";
import { useGetRiskData } from "@workspace/api-client-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import { Cloud, TrendingDown, Ship, AlertTriangle, Zap } from "lucide-react";
import { cn } from "@/lib/utils";

type Category = "climate" | "economic" | "supply_chain";

interface CrisisSectionProps {
  category: Category;
  onCountrySelect?: (country: string) => void;
  highlightAnomalies?: boolean;
  highlightHighRisk?: boolean;
  selectedCountry?: string;
  className?: string;
}

const CRISIS_CONFIG: Record<Category, {
  title: string;
  subtitle: string;
  Icon: React.ComponentType<{ className?: string }>;
  color: string;
  borderColor: string;
  bgColor: string;
  badgeColor: string;
  activeBorder: string;
}> = {
  climate: {
    title: "Climate Crisis",
    subtitle: "Extreme weather · floods · wildfires",
    Icon: Cloud,
    color: "text-cyan-400",
    borderColor: "border-cyan-500/30",
    bgColor: "bg-cyan-500/5",
    badgeColor: "bg-cyan-500/10 text-cyan-400 border-cyan-500/30",
    activeBorder: "border-cyan-400/60 shadow-cyan-500/10 shadow-lg",
  },
  economic: {
    title: "Economic Crisis",
    subtitle: "Market collapse · inflation · debt",
    Icon: TrendingDown,
    color: "text-amber-400",
    borderColor: "border-amber-500/30",
    bgColor: "bg-amber-500/5",
    badgeColor: "bg-amber-500/10 text-amber-400 border-amber-500/30",
    activeBorder: "border-amber-400/60 shadow-amber-500/10 shadow-lg",
  },
  supply_chain: {
    title: "Supply Chain",
    subtitle: "Port disruptions · shortages · logistics",
    Icon: Ship,
    color: "text-rose-400",
    borderColor: "border-rose-500/30",
    bgColor: "bg-rose-500/5",
    badgeColor: "bg-rose-500/10 text-rose-400 border-rose-500/30",
    activeBorder: "border-rose-400/60 shadow-rose-500/10 shadow-lg",
  },
};

const RISK_LEVEL_STYLE: Record<string, string> = {
  High: "bg-destructive/10 text-destructive border-destructive/30",
  Medium: "bg-warning/10 text-warning border-warning/30",
  Low: "bg-success/10 text-success border-success/30",
};

const COUNTRY_CODES: Record<string, string> = {
  USA: "us", China: "cn", India: "in", Brazil: "br", Germany: "de",
  Russia: "ru", Australia: "au", Japan: "jp", UK: "gb", France: "fr",
  Nigeria: "ng", Pakistan: "pk", Indonesia: "id", Bangladesh: "bd",
  Mexico: "mx", Canada: "ca", "South Korea": "kr", Turkey: "tr",
  Iran: "ir", Egypt: "eg", "South Africa": "za", Taiwan: "tw",
  Vietnam: "vn", "Saudi Arabia": "sa", Netherlands: "nl", Singapore: "sg",
  Argentina: "ar", Afghanistan: "af", Vanuatu: "vu", Micronesia: "fm",
  Tonga: "to", Philippines: "ph", "Papua New Guinea": "pg",
  "Kermadec Islands region": "nz", "New Zealand": "nz", "EU": "eu"
};

export const CrisisSection = React.memo(function CrisisSection({
  category,
  onCountrySelect,
  highlightAnomalies,
  highlightHighRisk,
  selectedCountry,
  className
}: CrisisSectionProps) {
  const cfg = CRISIS_CONFIG[category];
  const { Icon } = cfg;
  const isHighlighted = highlightAnomalies || highlightHighRisk;

  const { data: allEvents, isLoading, isError, refetch } = useGetRiskData({
    query: { refetchInterval: 30000, queryKey: ["/api/risk/data"] },
  });

  const events = useMemo(() => {
    if (!allEvents) return [];
    let filtered = allEvents.filter((e) => e.category === category);
    if (selectedCountry) filtered = filtered.filter((e) => e.country === selectedCountry);
    if (highlightAnomalies) filtered = filtered.filter((e) => e.isAnomaly);
    if (highlightHighRisk) filtered = filtered.filter((e) => e.riskLevel === "High");
    return [...filtered].sort((a, b) => b.riskScore - a.riskScore);
  }, [allEvents, category, highlightAnomalies, highlightHighRisk, selectedCountry]);

  const allCategoryEvents = useMemo(() => {
    if (!allEvents) return [];
    return allEvents.filter((e) => e.category === category && (!selectedCountry || e.country === selectedCountry));
  }, [allEvents, category, selectedCountry]);

  const stats = useMemo(() => {
    if (!allCategoryEvents.length) return { high: 0, avg: 0, total: 0, anomalies: 0 };
    return {
      high: allCategoryEvents.filter((e) => e.riskLevel === "High").length,
      anomalies: allCategoryEvents.filter((e) => e.isAnomaly).length,
      avg: allCategoryEvents.reduce((s, e) => s + e.riskScore, 0) / allCategoryEvents.length,
      total: allCategoryEvents.length,
    };
  }, [allCategoryEvents]);

  return (
    <Card
      className={cn(
        "flex flex-col border backdrop-blur-sm transition-all duration-300 h-full",
        isHighlighted ? cfg.activeBorder : cfg.borderColor,
        cfg.bgColor,
        className
      )}
      data-testid={`crisis-section-${category}`}
    >
      {/* Header */}
      <CardHeader className={cn("pb-3 border-b", cfg.borderColor)}>
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center gap-2">
            <div className={cn("p-1.5 rounded-md border", cfg.bgColor, cfg.borderColor, isHighlighted && "animate-pulse")}>
              <Icon className={cn("h-4 w-4", cfg.color)} />
            </div>
            <div>
              <CardTitle className={cn("text-base font-bold", cfg.color)}>
                {cfg.title}
              </CardTitle>
              <p className="text-[10px] text-muted-foreground mt-0.5 uppercase tracking-wider">
                {highlightAnomalies
                  ? "Showing anomaly events only"
                  : highlightHighRisk
                  ? "Showing critical risk zones"
                  : selectedCountry
                  ? `Focused on ${selectedCountry}`
                  : cfg.subtitle}
              </p>
            </div>
          </div>
          {stats.high > 0 && (
            <Badge
              variant="outline"
              className={cn("text-[10px] shrink-0", cfg.badgeColor, stats.high > 0 && "animate-pulse")}
            >
              {stats.high} CRITICAL
            </Badge>
          )}
        </div>

        {/* Mini stats */}
        <div className="grid grid-cols-3 gap-2 mt-3">
          {[
            {
              label: highlightAnomalies ? "Anomalies" : highlightHighRisk ? "Critical" : "Countries",
              value: events.length,
            },
            { label: "Avg Risk", value: `${(stats.avg * 100).toFixed(0)}%` },
            { label: "Anomalies", value: stats.anomalies },
          ].map((s) => (
            <div key={s.label} className="text-center">
              <div className={cn("text-lg font-bold font-mono", cfg.color)}>
                {isLoading ? "—" : s.value}
              </div>
              <div className="text-[9px] uppercase tracking-widest text-muted-foreground">
                {s.label}
              </div>
            </div>
          ))}
        </div>
      </CardHeader>

      {/* Country list */}
      <CardContent className="p-0 flex-1">
        <ScrollArea className="h-[340px]">
          {isLoading ? (
            <div className="p-3 space-y-2">
              {Array.from({ length: 5 }).map((_, i) => (
                <Skeleton key={i} className="h-12 w-full rounded-md" />
              ))}
            </div>
          ) : isError ? (
            <div className="flex flex-col items-center justify-center h-full min-h-[150px] gap-3 px-4 text-center">
              <AlertTriangle className="h-8 w-8 text-destructive opacity-80" />
              <div className="space-y-1">
                <p className="text-sm font-medium">Failed to load data</p>
                <p className="text-xs text-muted-foreground">Unable to fetch {cfg.title.toLowerCase()} events.</p>
              </div>
              <button 
                onClick={() => refetch()}
                className="mt-2 px-3 py-1.5 text-xs font-medium border border-border rounded-md hover:bg-muted transition-colors"
              >
                Try Again
              </button>
            </div>
          ) : events.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-32 text-sm text-muted-foreground gap-2">
              <span className="text-2xl opacity-40">
                {highlightAnomalies ? "✓" : highlightHighRisk ? "✓" : "—"}
              </span>
              <span>
                {highlightAnomalies
                  ? "No anomalies in this category"
                  : highlightHighRisk
                  ? "No critical zones in this category"
                  : selectedCountry
                  ? `No ${cfg.title.toLowerCase()} data for ${selectedCountry}`
                  : "No data available"}
              </span>
            </div>
          ) : (
            <div className="divide-y divide-border/30">
              {events.map((event, idx) => {
                const isRowHighlighted =
                  (highlightAnomalies && event.isAnomaly) ||
                  (highlightHighRisk && event.riskLevel === "High");

                return (
                  <button
                    key={event.id}
                    onClick={() => onCountrySelect?.(event.country)}
                    data-testid={`country-row-${category}-${event.id}`}
                    className={cn(
                      "w-full flex items-center gap-3 px-4 py-3 min-h-[50px] text-left transition-colors group",
                      isRowHighlighted
                        ? "bg-destructive/10 hover:bg-destructive/15"
                        : "hover:bg-white/5",
                    )}
                  >
                    <span className="text-[10px] font-mono text-muted-foreground w-4 shrink-0">
                      {String(idx + 1).padStart(2, "0")}
                    </span>

                    <div className="flex items-center gap-2 flex-1 min-w-0">
                      <span className="shrink-0 w-6 h-6 flex items-center justify-center text-base">
                        {COUNTRY_CODES[event.country] ? (
                          <img 
                            src={`https://flagcdn.com/w20/${COUNTRY_CODES[event.country]}.png`} 
                            alt={event.country} 
                            className="w-5 h-auto rounded-[2px] object-cover" 
                          />
                        ) : (
                          "🌍"
                        )}
                      </span>
                      <div className="min-w-0">
                        <div className="text-sm font-medium truncate text-foreground/90 group-hover:text-foreground">
                          {event.country}
                        </div>
                        <div className="text-[10px] text-muted-foreground uppercase tracking-wide flex items-center gap-1">
                          {event.region}
                          {event.isAnomaly && (
                            <span className="text-destructive font-medium">· anomaly</span>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="shrink-0 flex flex-col items-end gap-1.5 w-24">
                      <div className="flex items-center gap-1.5">
                        <span className={cn("text-xs font-mono font-bold", cfg.color)}>
                          {(event.riskScore * 100).toFixed(0)}%
                        </span>
                        <Badge
                          variant="outline"
                          className={cn("text-[9px] px-1 py-0 h-4", RISK_LEVEL_STYLE[event.riskLevel])}
                        >
                          {event.riskLevel}
                        </Badge>
                      </div>
                      <div className="w-full h-1 bg-secondary/60 rounded-full overflow-hidden">
                        <div
                          className={cn(
                            "h-full rounded-full transition-all",
                            event.riskLevel === "High" ? "bg-destructive" :
                            event.riskLevel === "Medium" ? "bg-warning" : "bg-success",
                          )}
                          style={{ width: `${event.riskScore * 100}%` }}
                        />
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </ScrollArea>
      </CardContent>

      {!isLoading && stats.high > 0 && (
        <div className={cn(
          "px-4 py-2 border-t text-[10px] font-mono uppercase tracking-widest flex items-center gap-1.5",
          cfg.borderColor, cfg.color,
        )}>
          <AlertTriangle className="h-3 w-3" />
          {stats.high} countries at critical threshold
          {stats.anomalies > 0 && (
            <span className="ml-auto flex items-center gap-1 text-muted-foreground">
              <Zap className="h-3 w-3" />
              {stats.anomalies} anomalies
            </span>
          )}
        </div>
      )}
    </Card>
  );
});
