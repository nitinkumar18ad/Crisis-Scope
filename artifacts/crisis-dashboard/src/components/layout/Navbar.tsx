import React from "react";
import { Link } from "wouter";
import { Globe, Activity, Menu, X } from "lucide-react";
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

  const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false);

  return (
    <header className="sticky top-0 z-50 w-full max-w-[100vw] border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 overflow-x-hidden">
      <div className="container flex h-16 max-w-none items-center justify-between px-4 md:px-8">
        <div className="flex items-center gap-4">
          <Link href="/" className="flex items-center space-x-2">
            <Globe className="h-6 w-6 text-primary" />
            <span className="font-bold tracking-wider text-sm md:text-base">
              CRISIS AI
            </span>
          </Link>
          <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-destructive/10 border border-destructive/20 text-destructive text-xs font-mono font-medium">
            <div className="w-2 h-2 rounded-full bg-destructive animate-pulse-dot" />
            LIVE
          </div>
        </div>

        <div className="hidden md:flex items-center gap-6">
          <div className="flex items-center text-sm font-mono text-muted-foreground bg-muted/30 px-3 py-1.5 rounded-md border border-border/50">
            {time.toISOString().replace('T', ' ').substring(0, 19)} UTC
          </div>
          <div className="flex items-center gap-2">
            <Activity className="h-4 w-4 text-muted-foreground" />
            <Badge variant="outline" className="bg-card text-card-foreground border-border font-mono">
              {summary ? summary.totalAlerts : "..."} ALERTS
            </Badge>
          </div>
        </div>

        <button
          className="md:hidden p-2 text-foreground"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          aria-label="Toggle Menu"
        >
          <Menu className="h-6 w-6" />
        </button>
      </div>

      {/* Mobile Drawer */}
      <div
        className={`fixed inset-y-0 right-0 z-50 w-64 bg-background border-l border-border transform transition-transform duration-300 ease-in-out md:hidden ${
          isMobileMenuOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="p-4 flex flex-col gap-4">
          <button
            className="self-end p-2 text-foreground"
            onClick={() => setIsMobileMenuOpen(false)}
            aria-label="Close Menu"
          >
            <X className="h-6 w-6" />
          </button>
          
          <div className="flex flex-col gap-4 mt-8">
            <div className="flex flex-col text-sm font-mono text-muted-foreground bg-muted/30 px-3 py-2 rounded-md border border-border/50">
              <span className="text-xs uppercase tracking-wider mb-1">Current Time (UTC)</span>
              {time.toISOString().replace('T', ' ').substring(0, 19)}
            </div>
            
            <div className="flex items-center gap-2 p-3 bg-card rounded-md border border-border">
              <Activity className="h-4 w-4 text-primary" />
              <div className="flex flex-col">
                <span className="text-xs text-muted-foreground uppercase tracking-wider">Total Alerts</span>
                <span className="font-mono font-bold text-foreground">
                  {summary ? summary.totalAlerts : "..."}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Overlay */}
      {isMobileMenuOpen && (
        <div 
          className="fixed inset-0 z-40 bg-background/80 backdrop-blur-sm md:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}
    </header>
  );
}
