import { useGetAnomalies } from "@workspace/api-client-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Radar } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

export function AnomaliesList() {
  const { data: anomalies, isLoading } = useGetAnomalies({
    query: { refetchInterval: 30000, queryKey: ["/api/risk/anomalies"] }
  });

  return (
    <Card className="bg-card/50 backdrop-blur-sm border-primary/20" data-testid="anomalies-list">
      <CardHeader className="pb-3 border-b border-border/50">
        <div className="flex items-center gap-2">
          <Radar className="h-5 w-5 text-primary animate-pulse" />
          <CardTitle className="text-lg">System Anomalies</CardTitle>
        </div>
      </CardHeader>
      <CardContent className="p-4">
        {isLoading ? (
          <div className="space-y-3">
            {[1, 2].map(i => (
              <Skeleton key={i} className="h-16 w-full rounded-md" />
            ))}
          </div>
        ) : anomalies?.length === 0 ? (
          <div className="text-center py-6 text-sm text-muted-foreground">
            No anomalies detected in the network.
          </div>
        ) : (
          <div className="space-y-3">
            {anomalies?.map((event) => (
              <div 
                key={event.id} 
                className="p-3 rounded-md border border-primary/30 bg-primary/5 flex items-center justify-between"
              >
                <div>
                  <div className="font-medium text-sm text-foreground">{event.country}</div>
                  <div className="text-xs text-muted-foreground uppercase mt-1">{event.category}</div>
                </div>
                <div className="text-right">
                  <Badge variant="outline" className="text-primary border-primary bg-primary/10">
                    ANOMALY
                  </Badge>
                  <div className="font-mono text-xs mt-1 text-muted-foreground">
                    DEV: +{(event.riskScore * 100).toFixed(1)}%
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
