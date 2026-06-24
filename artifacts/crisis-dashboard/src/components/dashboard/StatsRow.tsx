import { Activity, AlertTriangle, Globe, Zap } from "lucide-react";
import { CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MagicCard } from "@/components/ui/MagicBento";
import { Skeleton } from "@/components/ui/skeleton";
import { useGetGlobalSummary } from "@workspace/api-client-react";
import { cn } from "@/lib/utils";

export type StatCardTarget = "alerts" | "highRisk" | "avgRisk" | "anomalies";

interface StatsRowProps {
  onCardClick?: (target: StatCardTarget) => void;
  activeTarget?: StatCardTarget | null;
}

export function StatsRow({ onCardClick, activeTarget }: StatsRowProps) {
  const { data, isLoading } = useGetGlobalSummary({
    query: { refetchInterval: 30000, queryKey: ["/api/risk/summary"] },
  });

  const stats: {
    title: string;
    value: string | number;
    icon: React.ComponentType<{ className?: string }>;
    color: string;
    bgColor: string;
    borderColor: string;
    activeBorder: string;
    target: StatCardTarget;
    hint: string;
    glowColor: string;
  }[] = [
    {
      title: "Total Alerts",
      value: data?.totalAlerts ?? 0,
      icon: AlertTriangle,
      color: "text-destructive",
      bgColor: "bg-destructive/10",
      borderColor: "border-destructive/20",
      activeBorder: "border-destructive/70 shadow-destructive/20 shadow-lg",
      target: "alerts",
      hint: "View all crisis zones",
      glowColor: "239, 68, 68",
    },
    {
      title: "High Risk Zones",
      value: data?.highRiskZones ?? 0,
      icon: Activity,
      color: "text-warning",
      bgColor: "bg-warning/10",
      borderColor: "border-warning/20",
      activeBorder: "border-warning/70 shadow-warning/20 shadow-lg",
      target: "highRisk",
      hint: "Filter map to high risk",
      glowColor: "245, 158, 11",
    },
    {
      title: "Avg Global Risk",
      value: data ? `${(data.avgGlobalRiskScore * 100).toFixed(1)}%` : "0%",
      icon: Globe,
      color: "text-primary",
      bgColor: "bg-primary/10",
      borderColor: "border-primary/20",
      activeBorder: "border-primary/70 shadow-primary/20 shadow-lg",
      target: "avgRisk",
      hint: "View trend chart",
      glowColor: "59, 130, 246",
    },
    {
      title: "Anomalies",
      value: data?.anomaliesDetected ?? 0,
      icon: Zap,
      color: "text-purple-400",
      bgColor: "bg-purple-500/10",
      borderColor: "border-purple-500/20",
      activeBorder: "border-purple-400/70 shadow-purple-500/20 shadow-lg",
      target: "anomalies",
      hint: "Highlight anomaly events",
      glowColor: "167, 139, 250",
    },
  ];

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4" data-testid="stats-row">
      {stats.map((stat) => {
        const isActive = activeTarget === stat.target;
        return (
          <button
            key={stat.target}
            onClick={() => onCardClick?.(stat.target)}
            data-testid={`stat-card-${stat.target}`}
            className="text-left w-full focus:outline-none group"
          >
            <MagicCard
              glowColor={stat.glowColor}
              enableStars={false}
              className={cn(
                "bg-card/50 backdrop-blur-sm border overflow-hidden relative transition-all duration-300 cursor-pointer h-full",
                isActive ? stat.activeBorder : stat.borderColor,
                "hover:scale-[1.02]",
              )}
            >
              {/* Glow layer */}
              <div
                className={cn(
                  "absolute inset-0 transition-opacity duration-500",
                  stat.bgColor,
                  isActive ? "opacity-100 blur-2xl" : "opacity-0 group-hover:opacity-60 blur-2xl",
                )}
              />

              {/* Active pulse ring */}
              {isActive && (
                <div className={cn("absolute inset-0 rounded-lg animate-pulse", stat.bgColor, "opacity-30")} />
              )}

              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 relative z-10">
                <CardTitle className="text-xs font-medium tracking-wide uppercase text-muted-foreground">
                  {stat.title}
                </CardTitle>
                <div className={cn("p-2 rounded-md transition-colors", stat.bgColor, isActive && "ring-1 ring-current")}>
                  <stat.icon className={cn("h-4 w-4", stat.color)} />
                </div>
              </CardHeader>

              <CardContent className="relative z-10 pb-3">
                {isLoading ? (
                  <Skeleton className="h-8 w-20" />
                ) : (
                  <div className="text-3xl font-bold font-mono tracking-tight text-foreground">
                    {stat.value}
                  </div>
                )}
                {/* Hint text */}
                <p className={cn(
                  "text-[10px] mt-1.5 transition-all duration-200 uppercase tracking-wider font-medium",
                  isActive ? stat.color : "text-muted-foreground/50 group-hover:text-muted-foreground",
                )}>
                  {isActive ? "↓ Showing below" : stat.hint} →
                </p>
              </CardContent>
            </MagicCard>
          </button>
        );
      })}
    </div>
  );
}
