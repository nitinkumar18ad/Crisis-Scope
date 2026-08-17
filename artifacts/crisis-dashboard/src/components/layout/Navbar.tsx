import React from "react";
import { Link } from "wouter";
import { Activity, Menu, X } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useGetGlobalSummary } from "@workspace/api-client-react";

const NAV_LINKS = [
  { href: "#crisis-intelligence", label: "Intelligence" },
  { href: "#global-risk-map", label: "Risk Map" },
  { href: "#risk-trends", label: "Trends" },
];

export function Navbar() {
  const [time, setTime] = React.useState(new Date());
  const [mounted, setMounted] = React.useState(false);
  const [pointer, setPointer] = React.useState({ x: 50, y: 50 });
  const [telemetry, setTelemetry] = React.useState({
    latitude: "00.000",
    longitude: "000.000",
    signal: 98,
  });
  const reduceMotion = React.useMemo(() => {
    if (typeof window === "undefined") return true;
    return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  }, []);

  React.useEffect(() => {
    setMounted(true);
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  React.useEffect(() => {
    if (reduceMotion) return;

    const telemetryTimer = window.setInterval(() => {
      const latitude = (Math.sin(Date.now() / 7000) * 67.5).toFixed(3);
      const longitude = (Math.cos(Date.now() / 6200) * 128.4).toFixed(3);
      const signal = 90 + Math.floor((Math.sin(Date.now() / 2500) + 1) * 5);

      setTelemetry({ latitude, longitude, signal });
    }, 1800);

    return () => window.clearInterval(telemetryTimer);
  }, [reduceMotion]);

  React.useEffect(() => {
    if (reduceMotion) return;

    const handlePointerMove = (event: PointerEvent) => {
      const x = (event.clientX / window.innerWidth) * 100;
      const y = (event.clientY / window.innerHeight) * 100;
      setPointer({ x, y });
    };

    window.addEventListener("pointermove", handlePointerMove, { passive: true });
    return () => window.removeEventListener("pointermove", handlePointerMove);
  }, [reduceMotion]);

  const { data: summary } = useGetGlobalSummary({
    query: { refetchInterval: 30000, queryKey: ["/api/risk/summary"] }
  });

  const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false);

  return (
    <header className="site-header sticky top-0 z-50 w-full border-b border-border/40 bg-background/90 backdrop-blur-xl">
      <div
        className="header-parallax pointer-events-none absolute inset-0 opacity-70"
        style={{
          transform: reduceMotion ? "none" : `translate3d(${(pointer.x - 50) * 0.05}px, ${(pointer.y - 50) * 0.05}px, 0)`,
        }}
      >
        <div className="header-grid" />
        <div className="header-radar" />
        <div className="header-scanline" />
        {!reduceMotion && (
          <>
            <span className="header-particle header-particle-a" />
            <span className="header-particle header-particle-b" />
            <span className="header-particle header-particle-c" />
            <span className="header-stream header-stream-a" />
            <span className="header-stream header-stream-b" />
          </>
        )}
      </div>

      <div className="container relative flex h-18 max-w-none items-center justify-between gap-4 px-4 md:px-8">
        <div className="flex min-w-0 items-center gap-3">
          <Link href="/" className="group flex items-center gap-3 rounded-full transition-transform duration-300 hover:scale-[1.01]">
            <img
              src="/logo-inverted.png"
              alt="Crisis Scope logo"
              className="header-logo-image h-16 w-16 shrink-0 rounded-full object-cover"
            />
            <span className="flex min-w-0 flex-col leading-none">
              <span className="header-logo-text truncate text-sm font-semibold tracking-[0.28em] text-slate-100 md:text-base">
                CRISIS SCOPE
              </span>
              <span className="mt-1 flex items-center gap-2 text-[10px] uppercase tracking-[0.32em] text-cyan-100/70">
                Global AI Monitoring
                <span className="hidden h-1 w-1 rounded-full bg-cyan-300/80 sm:inline-block" />
                {mounted ? `${telemetry.latitude} • ${telemetry.longitude}` : "00.000 • 000.000"}
              </span>
            </span>
          </Link>

          <div className="hidden items-center gap-2 rounded-full border border-red-400/25 bg-red-500/10 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.28em] text-red-100 backdrop-blur-md sm:flex">
            <span className="relative flex h-2.5 w-2.5 items-center justify-center">
              <span className="absolute h-full w-full rounded-full bg-red-400/70 animate-ping" />
              <span className="relative h-2 w-2 rounded-full bg-red-300 shadow-[0_0_14px_rgba(248,113,113,0.9)]" />
            </span>
            LIVE
          </div>
        </div>

        <div className="hidden flex-1 items-center justify-center gap-3 xl:flex">
          <div className="rounded-full border border-cyan-300/20 bg-linear-to-r from-cyan-400/10 via-blue-500/10 to-violet-500/10 px-3 py-1.5 text-xs font-mono text-cyan-100/90 shadow-[0_0_28px_rgba(56,189,248,0.12)] backdrop-blur-md">
            {time.toISOString().replace("T", " ").substring(0, 19)} UTC
          </div>
          <div className="flex items-center gap-2 rounded-full border border-cyan-300/20 bg-linear-to-r from-cyan-400/10 via-blue-500/10 to-violet-500/10 px-3 py-1.5 shadow-[0_0_28px_rgba(56,189,248,0.12)] backdrop-blur-md">
            <Activity className="h-4 w-4 text-muted-foreground" />
            <Badge variant="outline" className="border-border/60 bg-card/80 font-mono text-card-foreground shadow-none">
              {summary ? summary.totalAlerts : "..."} ALERTS
            </Badge>
          </div>
        </div>

        <nav className="hidden items-center gap-2 lg:flex">
          {NAV_LINKS.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="header-nav-link rounded-full px-3 py-2 text-sm font-medium text-slate-200/80 transition-colors"
            >
              {link.label}
            </a>
          ))}
        </nav>

        <button
          className="rounded-md p-2 text-foreground transition-colors hover:bg-white/10 md:hidden"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          aria-label="Toggle Menu"
          style={{ touchAction: 'manipulation' }}
        >
          <Menu className="h-6 w-6" />
        </button>
      </div>

      {/* Mobile Drawer */}
      <div
        className={`fixed inset-y-0 right-0 z-50 w-72 border-l border-border/40 bg-slate-950/95 backdrop-blur-xl transform transition-transform duration-300 ease-in-out md:hidden ${isMobileMenuOpen ? "translate-x-0" : "translate-x-full"
          }`}
      >
        <div className="flex flex-col gap-4 p-4">
          <button
            className="self-end p-2 text-foreground"
            onClick={() => setIsMobileMenuOpen(false)}
            aria-label="Close Menu"
          >
            <X className="h-6 w-6" />
          </button>

          <div className="mt-8 flex flex-col gap-4">
            <div className="rounded-xl border border-white/10 bg-white/5 px-3 py-2 font-mono text-sm text-muted-foreground">
              <span className="mb-1 block text-xs uppercase tracking-wider">Current Time (UTC)</span>
              {time.toISOString().replace('T', ' ').substring(0, 19)}
            </div>

            <div className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 p-3">
              <Activity className="h-4 w-4 text-primary" />
              <div className="flex flex-col">
                <span className="text-xs text-muted-foreground uppercase tracking-wider">Total Alerts</span>
                <span className="font-mono font-bold text-foreground">
                  {summary ? summary.totalAlerts : "..."}
                </span>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-2">
              {NAV_LINKS.map((link) => (
                <a
                  key={link.href}
                  href={link.href}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="rounded-xl border border-white/10 bg-white/5 px-3 py-3 text-sm text-slate-100 transition-colors hover:bg-white/10"
                >
                  {link.label}
                </a>
              ))}
            </div>

            <div className="flex flex-wrap gap-2">
              <span className="rounded-full border border-cyan-400/20 bg-cyan-400/10 px-3 py-1 text-[10px] uppercase tracking-[0.28em] text-cyan-100">24/7 Monitoring</span>
              <span className="rounded-full border border-violet-400/20 bg-violet-400/10 px-3 py-1 text-[10px] uppercase tracking-[0.28em] text-violet-100">AI Powered</span>
              <span className="rounded-full border border-emerald-400/20 bg-emerald-400/10 px-3 py-1 text-[10px] uppercase tracking-[0.28em] text-emerald-100">Real-Time Intelligence</span>
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
