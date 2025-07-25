import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Cell } from "recharts";

const data = [
  { name: "Instagram", minutes: 45, type: "distraction" },
  { name: "VS Code", minutes: 180, type: "focus" },
  { name: "Chrome", minutes: 90, type: "neutral" },
  { name: "TikTok", minutes: 30, type: "distraction" },
  { name: "Notion", minutes: 75, type: "focus" },
  { name: "Messages", minutes: 25, type: "neutral" },
];

export function AppUsageChart() {
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
    <Card className="col-span-2">
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
      </CardContent>
    </Card>
  );
}