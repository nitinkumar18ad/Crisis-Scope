import { useGetRiskHistory } from "@workspace/api-client-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";
import { cn } from "@/lib/utils";

interface RiskChartProps {
  highlighted?: boolean;
}

export function RiskChart({ highlighted }: RiskChartProps) {
  const { data, isLoading } = useGetRiskHistory({
    query: { refetchInterval: 30000, queryKey: ["/api/risk/history"] },
  });

  return (
    <Card
      className={cn(
        "bg-card/50 backdrop-blur-sm transition-all duration-300",
        highlighted
          ? "border-primary/50 shadow-primary/10 shadow-lg"
          : "border-border",
      )}
      data-testid="risk-history-chart"
    >
      <CardHeader>
        <CardTitle className={cn("text-lg transition-colors", highlighted && "text-primary")}>
          Global Risk Trends (30 Days)
        </CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="h-[300px] flex items-center justify-center">
            <Skeleton className="w-full h-full rounded-xl" />
          </div>
        ) : (
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={data} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
                <XAxis
                  dataKey="date"
                  stroke="hsl(var(--muted-foreground))"
                  fontSize={12}
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={(val) =>
                    new Date(val).toLocaleDateString(undefined, { month: "short", day: "numeric" })
                  }
                />
                <YAxis
                  stroke="hsl(var(--muted-foreground))"
                  fontSize={12}
                  tickLine={false}
                  axisLine={false}
                  domain={[0, 1]}
                  tickFormatter={(val) => `${(val * 100).toFixed(0)}%`}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "hsl(var(--card))",
                    borderColor: "hsl(var(--border))",
                    borderRadius: "8px",
                    fontFamily: "var(--app-font-sans)",
                    fontSize: "12px",
                  }}
                  labelFormatter={(val) => new Date(val).toLocaleDateString()}
                  formatter={(value: number) => [`${(value * 100).toFixed(1)}%`]}
                />
                <Legend iconType="circle" wrapperStyle={{ fontSize: "12px", paddingTop: "10px" }} />
                <Line type="monotone" dataKey="climate"      name="Climate Risk"       stroke="hsl(190 100% 50%)" strokeWidth={highlighted ? 3 : 2} dot={false} activeDot={{ r: 6 }} />
                <Line type="monotone" dataKey="economic"     name="Economic Risk"      stroke="hsl(38 92% 50%)"   strokeWidth={highlighted ? 3 : 2} dot={false} activeDot={{ r: 6 }} />
                <Line type="monotone" dataKey="supply_chain" name="Supply Chain Risk"  stroke="hsl(0 84% 60%)"    strokeWidth={highlighted ? 3 : 2} dot={false} activeDot={{ r: 6 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
