import React, { useState } from "react";
import { MapContainer, TileLayer, CircleMarker, Popup } from "react-leaflet";
import L from "leaflet";
import { useGetRiskData } from "@workspace/api-client-react";
import { Badge } from "@/components/ui/badge";
import { Loader2, Cloud, TrendingDown, Ship, Globe } from "lucide-react";
import { cn } from "@/lib/utils";

delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
  iconUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
  shadowUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
});

type Category = "climate" | "economic" | "supply_chain" | "all";

interface WorldMapProps {
  onCountrySelect: (country: string) => void;
  highlightHighRisk?: boolean;
}

const CATEGORY_TABS: {
  key: Category;
  label: string;
  Icon: React.ComponentType<{ className?: string }>;
  color: string;
  activeClass: string;
}[] = [
  {
    key: "all",
    label: "All Crises",
    Icon: Globe,
    color: "text-primary",
    activeClass: "bg-primary/10 text-primary border-primary/40",
  },
  {
    key: "climate",
    label: "Climate",
    Icon: Cloud,
    color: "text-cyan-400",
    activeClass: "bg-cyan-500/10 text-cyan-400 border-cyan-500/40",
  },
  {
    key: "economic",
    label: "Economic",
    Icon: TrendingDown,
    color: "text-amber-400",
    activeClass: "bg-amber-500/10 text-amber-400 border-amber-500/40",
  },
  {
    key: "supply_chain",
    label: "Supply Chain",
    Icon: Ship,
    color: "text-rose-400",
    activeClass: "bg-rose-500/10 text-rose-400 border-rose-500/40",
  },
];

const CATEGORY_COLORS: Record<Category, Record<string, string>> = {
  all: { High: "#ef4444", Medium: "#f59e0b", Low: "#22c55e" },
  climate: { High: "#06b6d4", Medium: "#67e8f9", Low: "#a5f3fc" },
  economic: { High: "#f59e0b", Medium: "#fcd34d", Low: "#fef08a" },
  supply_chain: { High: "#f43f5e", Medium: "#fb7185", Low: "#fda4af" },
};

export function WorldMap({
  onCountrySelect,
  highlightHighRisk,
}: WorldMapProps) {
  const [filter, setFilter] = useState<Category>("all");

  const { data: riskEvents, isLoading } = useGetRiskData({
    query: { refetchInterval: 30000, queryKey: ["/api/risk/data"] },
  });

  const visibleEvents =
    riskEvents?.filter((e) => {
      const catMatch = filter === "all" || e.category === filter;
      const riskMatch = !highlightHighRisk || e.riskLevel === "High";
      return catMatch && riskMatch;
    }) ?? [];

  const colors = CATEGORY_COLORS[filter];
  const getRiskColor = (level: string) => colors[level] ?? "#00d4ff";

  return (
    <div
      className="rounded-xl border border-border overflow-hidden bg-card/50 backdrop-blur-sm"
      data-testid="world-map"
    >
      <div className="flex items-center gap-2 px-4 py-3 border-b border-border/50 bg-background/40 flex-wrap">
        {CATEGORY_TABS.map(({ key, label, Icon, color, activeClass }) => (
          <button
            key={key}
            onClick={() => setFilter(key)}
            data-testid={`map-filter-${key}`}
            className={cn(
              "flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium border transition-all",
              filter === key
                ? activeClass
                : "border-transparent text-muted-foreground hover:text-foreground hover:bg-muted/30",
            )}
          >
            <Icon className={cn("h-3 w-3", filter === key ? color : "")} />
            {label}
            {riskEvents && (
              <span className="font-mono opacity-60 text-[10px]">
                {key === "all"
                  ? riskEvents.length
                  : riskEvents.filter((e) => e.category === key).length}
              </span>
            )}
          </button>
        ))}

        <div className="ml-auto flex items-center gap-3 text-[10px] font-mono">
          {highlightHighRisk && (
            <span className="text-warning flex items-center gap-1">
              Showing High Risk only
            </span>
          )}
          <span className="text-muted-foreground">
            {visibleEvents.filter((e) => e.riskLevel === "High").length}{" "}
            critical shown
          </span>
        </div>
      </div>

      <div className="h-[420px] relative z-0">
        {isLoading ? (
          <div className="w-full h-full flex items-center justify-center bg-background/50">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : (
          <MapContainer
            center={[20, 0]}
            zoom={2}
            minZoom={2}
            scrollWheelZoom={false}
            className="w-full h-full"
            maxBounds={[[-90, -180], [90, 180]]}
          >
            <TileLayer
              attribution=""
              url="https://cartodb-basemaps-{s}.global.ssl.fastly.net/dark_all/{z}/{x}/{y}.png"
            />
            {visibleEvents.map((event) => (
              <CircleMarker
                key={`${event.id}-${filter}-${highlightHighRisk}`}
                center={[event.lat, event.lng]}
                radius={Math.max(5, event.riskScore * 16)}
                pathOptions={{
                  color: getRiskColor(event.riskLevel),
                  fillColor: getRiskColor(event.riskLevel),
                  fillOpacity: highlightHighRisk ? 0.85 : 0.65,
                  weight: event.isAnomaly || highlightHighRisk ? 2 : 1,
                }}
                eventHandlers={{ click: () => onCountrySelect(event.country) }}
              >
                <Popup>
                  <div className="p-1 min-w-[140px]">
                    <div className="font-bold text-sm mb-1">
                      {event.country}
                    </div>
                    <div className="flex items-center gap-2 mb-2">
                      <Badge
                        variant={
                          event.riskLevel === "High"
                            ? "destructive"
                            : "secondary"
                        }
                        className="text-[10px]"
                      >
                        {event.riskLevel}
                      </Badge>
                      <span className="text-xs text-muted-foreground uppercase">
                        {event.category.replace("_", " ")} | {event.source}
                      </span>
                    </div>
                    <div className="text-xs">
                      Risk Score:{" "}
                      <span className="font-mono font-bold">
                        {(event.riskScore * 100).toFixed(1)}%
                      </span>
                    </div>
                    {event.isAnomaly && (
                      <div className="text-[10px] text-destructive mt-1 font-medium">
                        Anomaly detected
                      </div>
                    )}
                  </div>
                </Popup>
              </CircleMarker>
            ))}
          </MapContainer>
        )}
      </div>
    </div>
  );
}
