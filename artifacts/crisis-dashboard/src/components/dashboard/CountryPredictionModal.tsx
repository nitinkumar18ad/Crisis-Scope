import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle 
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useGetPrediction, useGetForecast } from "@workspace/api-client-react";
import { Loader2, Brain, TrendingUp } from "lucide-react";
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip } from "recharts";

import { useIsMobile } from "@/hooks/use-mobile";
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle } from "@/components/ui/drawer";

interface CountryPredictionModalProps {
  country: string | null;
  onClose: () => void;
}

export function CountryPredictionModal({ country, onClose }: CountryPredictionModalProps) {
  const isMobile = useIsMobile();
  const { data: prediction, isLoading: isPredictLoading } = useGetPrediction(
    { country: country || "" },
    { query: { enabled: !!country, queryKey: ["/api/risk/predict", country] } }
  );

  const { data: forecast, isLoading: isForecastLoading } = useGetForecast(
    { country: country || "" },
    { query: { enabled: !!country, queryKey: ["/api/risk/forecast", country] } }
  );

  const isLoading = isPredictLoading || isForecastLoading;

  const content = isLoading ? (
    <div className="py-12 flex flex-col items-center justify-center text-muted-foreground">
      <Loader2 className="h-8 w-8 animate-spin mb-4 text-primary" />
      <p className="text-sm font-mono animate-pulse">Analyzing planetary data streams...</p>
    </div>
  ) : prediction && forecast ? (
    <div className="space-y-6 py-4 px-4 sm:px-0">
      {/* Core Prediction */}
      <div className="flex items-center justify-between p-4 rounded-lg bg-background border border-border">
        <div>
          <p className="text-sm text-muted-foreground mb-1 uppercase tracking-wider">Predicted Risk</p>
          <div className="flex items-center gap-3">
            <span className="text-3xl font-bold font-mono">
              {(prediction.riskScore * 100).toFixed(1)}%
            </span>
            <Badge 
              variant={prediction.predictedRiskLevel === 'High' ? 'destructive' : prediction.predictedRiskLevel === 'Medium' ? 'default' : 'secondary'}
            >
              {prediction.predictedRiskLevel}
            </Badge>
          </div>
        </div>
        <div className="text-right">
          <p className="text-sm text-muted-foreground mb-1 uppercase tracking-wider">AI Confidence</p>
          <span className="text-xl font-mono text-primary">
            {(prediction.confidence * 100).toFixed(1)}%
          </span>
        </div>
      </div>

      {prediction.explanation && (
        <div className="text-sm text-muted-foreground p-4 bg-muted/30 rounded-lg border border-border/50 italic">
          "{prediction.explanation}"
        </div>
      )}

      {/* Feature breakdown */}
      <div className="space-y-3">
        <h4 className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Risk Vectors</h4>
        
        <div className="space-y-2">
          <div className="flex justify-between text-xs mb-1">
            <span>Climate Systems</span>
            <span className="font-mono text-[hsl(190,100%,50%)]">{(prediction.features.climate * 100).toFixed(0)}%</span>
          </div>
          <Progress value={prediction.features.climate * 100} className="h-1.5 [&>div]:bg-[hsl(190,100%,50%)]" />
        </div>

        <div className="space-y-2">
          <div className="flex justify-between text-xs mb-1">
            <span>Economic Stability</span>
            <span className="font-mono text-[hsl(38,92%,50%)]">{(prediction.features.economic * 100).toFixed(0)}%</span>
          </div>
          <Progress value={prediction.features.economic * 100} className="h-1.5 [&>div]:bg-[hsl(38,92%,50%)]" />
        </div>

        <div className="space-y-2">
          <div className="flex justify-between text-xs mb-1">
            <span>Supply Chain Integrity</span>
            <span className="font-mono text-[hsl(0,84%,60%)]">{(prediction.features.supplyChain * 100).toFixed(0)}%</span>
          </div>
          <Progress value={prediction.features.supplyChain * 100} className="h-1.5 [&>div]:bg-[hsl(0,84%,60%)]" />
        </div>
      </div>

      {/* 7 Day Forecast Chart */}
      <div className="space-y-3 pt-2 border-t border-border">
        <h4 className="flex items-center gap-2 text-sm font-medium text-muted-foreground uppercase tracking-wider">
          <TrendingUp className="h-4 w-4" />
          7-Day Trajectory
        </h4>
        <div className="h-[120px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={forecast.forecast} margin={{ top: 5, right: 0, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="colorRisk" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="hsl(190 100% 50%)" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="hsl(190 100% 50%)" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <XAxis 
                dataKey="date" 
                fontSize={10} 
                tickLine={false} 
                axisLine={false}
                tickFormatter={(val) => new Date(val).toLocaleDateString(undefined, { weekday: 'short' })}
              />
              <YAxis 
                fontSize={10} 
                tickLine={false} 
                axisLine={false} 
                domain={[0, 1]}
                tickFormatter={(val) => `${(val * 100).toFixed(0)}%`}
              />
              <Tooltip 
                contentStyle={{ backgroundColor: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '4px', fontSize: '12px' }}
                labelFormatter={(val) => new Date(val).toLocaleDateString()}
                formatter={(val: number) => [`${(val * 100).toFixed(1)}%`, 'Risk']}
              />
              <Area type="monotone" dataKey="riskScore" stroke="hsl(190 100% 50%)" fillOpacity={1} fill="url(#colorRisk)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  ) : (
    <div className="py-8 text-center text-muted-foreground text-sm">
      Failed to generate prediction data.
    </div>
  );

  if (isMobile) {
    return (
      <Drawer open={!!country} onOpenChange={() => onClose()}>
        <DrawerContent className="bg-card/95 backdrop-blur-xl border-t border-primary/20 max-h-[90vh]">
          <div className="overflow-y-auto w-full px-4">
            <DrawerHeader className="text-left px-0">
              <DrawerTitle className="flex items-center gap-2 text-xl">
                <Brain className="h-5 w-5 text-primary" />
                AI Prediction: {country}
              </DrawerTitle>
            </DrawerHeader>
            {content}
          </div>
        </DrawerContent>
      </Drawer>
    );
  }

  return (
    <Dialog open={!!country} onOpenChange={() => onClose()}>
      <DialogContent className="sm:max-w-[500px] border-primary/20 bg-card/95 backdrop-blur-xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl">
            <Brain className="h-5 w-5 text-primary" />
            AI Prediction: {country}
          </DialogTitle>
        </DialogHeader>
        {content}
      </DialogContent>
    </Dialog>
  );
}
