import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Cell } from "recharts";

export function HardcodedUsageChart() {
  // Hardcoded data as requested
  const data = [
    { name: "VS Code", minutes: 36, type: "focus" },
    { name: "YouTube", minutes: 22, type: "distraction" },
    { name: "TikTok", minutes: 17, type: "distraction" },
    { name: "Instagram", minutes: 7, type: "distraction" },
  ];

  const getBarColor = (type: string) => {
    switch (type) {
      case "focus":
        return "hsl(var(--focus))";
      case "distraction":
        return "hsl(var(--warning))";
      default:
        return "hsl(var(--calm))";
    }
  };

  return (
    <Card className="lg:col-span-2">
      <CardHeader>
        <CardTitle className="text-lg">Today's App Usage</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={200}>
          <BarChart data={data} margin={{ top: 5, right: 5, left: 5, bottom: 5 }}>
            <XAxis
              dataKey="name"
              fontSize={12}
              tickLine={false}
              axisLine={false}
            />
            <YAxis hide />
            <Bar dataKey="minutes" radius={[4, 4, 0, 0]}>
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={getBarColor(entry.type)} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
        <div className="flex items-center justify-center gap-6 mt-4">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-focus"></div>
            <span className="text-sm text-muted-foreground">Focus Apps</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-warning"></div>
            <span className="text-sm text-muted-foreground">Distracting</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-calm"></div>
            <span className="text-sm text-muted-foreground">Neutral</span>
          </div>
        </div>
        <div className="mt-4 pt-4 border-t">
          <div className="text-sm text-muted-foreground space-y-1">
            <div className="flex justify-between">
              <span>Total Screen Time:</span>
              <span className="font-medium">1h 22m</span>
            </div>
            <div className="flex justify-between">
              <span>Focus Time:</span>
              <span className="font-medium text-focus">36m (44%)</span>
            </div>
            <div className="flex justify-between">
              <span>Distraction Time:</span>
              <span className="font-medium text-warning">46m (56%)</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
