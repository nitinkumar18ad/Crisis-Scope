import { useGetAlerts } from "@workspace/api-client-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { AlertTriangle, Loader2 } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

export function AlertsPanel() {
  const { data: alerts, isLoading } = useGetAlerts({
    query: { refetchInterval: 30000, queryKey: ["/api/risk/alerts"] }
  });

  return (
    <Card className="flex flex-col h-[600px] border-destructive/20 bg-card/50 backdrop-blur-sm" data-testid="alerts-panel">
      <CardHeader className="pb-3 border-b border-border/50">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-lg">
            <AlertTriangle className="h-5 w-5 text-destructive" />
            Active Alerts
          </CardTitle>
          <Badge variant="destructive" className="animate-pulse">
            {alerts?.length || 0} HIGH RISK
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="p-0 flex-1 overflow-hidden">
        <ScrollArea className="h-full">
          {isLoading ? (
            <div className="p-4 space-y-4">
              {[1, 2, 3, 4].map(i => (
                <div key={i} className="flex flex-col gap-2 border border-border p-3 rounded-lg">
                  <Skeleton className="h-4 w-1/3" />
                  <Skeleton className="h-3 w-full" />
                </div>
              ))}
            </div>
          ) : alerts?.length === 0 ? (
            <div className="p-8 text-center text-muted-foreground flex flex-col items-center justify-center h-full">
              <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center mb-3">
                <AlertTriangle className="h-6 w-6 opacity-50" />
              </div>
              <p>No active high-risk alerts</p>
            </div>
          ) : (
            <div className="flex flex-col">
              {alerts?.map((alert) => (
                <div 
                  key={alert.id}
                  className={cn(
                    "flex flex-col p-4 border-b border-border/50 hover:bg-muted/20 transition-colors",
                    alert.severity === "High" ? "border-l-4 border-l-destructive" : "border-l-4 border-l-warning"
                  )}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <AlertTriangle className="h-4 w-4 text-warning" />
                      <span className="font-bold text-sm">{alert.title}</span>
                    </div>
                    <Badge variant="outline" className="text-[10px] uppercase text-muted-foreground border-border bg-background/50">
                      {alert.source}
                    </Badge>
                  </div>
                  
                  <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                    {alert.description}
                  </p>
                  
                  <div className="flex items-center justify-between mt-auto">
                    <div className="flex-1 mr-4">
                      <div className="h-1.5 w-full bg-secondary rounded-full overflow-hidden">
                        <div 
                          className={cn(
                            "h-full rounded-full",
                            alert.severity === "High" ? "bg-destructive" : "bg-warning"
                          )}
                          style={{ width: `100%` }}
                        />
                      </div>
                    </div>
                    <span className="text-xs font-mono text-muted-foreground">
                      {new Date(alert.createdAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
