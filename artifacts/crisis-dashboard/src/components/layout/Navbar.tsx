import React from "react";
import { Link } from "wouter";
import { Globe, Activity } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useGetGlobalSummary } from "@workspace/api-client-react";

export function Navbar() {
  const [time, setTime] = React.useState(new Date());

  React.useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const { data: summary } = useGetGlobalSummary({
    query: { refetchInterval: 30000, queryKey: ["/api/risk/summary"] }
  });

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 max-w-none items-center justify-between px-4 md:px-8">
        <div className="flex items-center gap-4">
          <Link href="/" className="flex items-center space-x-2">
            <Globe className="h-6 w-6 text-primary" />
            <span className="hidden font-bold sm:inline-block tracking-wider">
              GLOBAL CRISIS AI
            </span>
          </Link>
          <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-destructive/10 border border-destructive/20 text-destructive text-xs font-mono font-medium">
            <div className="w-2 h-2 rounded-full bg-destructive animate-pulse" />
            LIVE
          </div>
        </div>

        <div className="flex items-center gap-6">
          <div className="hidden md:flex items-center text-sm font-mono text-muted-foreground bg-muted/30 px-3 py-1.5 rounded-md border border-border/50">
            {time.toISOString().replace('T', ' ').substring(0, 19)} UTC
          </div>
          <div className="flex items-center gap-2">
            <Activity className="h-4 w-4 text-muted-foreground" />
            <Badge variant="outline" className="bg-card text-card-foreground border-border font-mono">
              {summary ? summary.totalAlerts : "..."} ALERTS
            </Badge>
          </div>
        </div>
      </div>
    </header>
  );
}
