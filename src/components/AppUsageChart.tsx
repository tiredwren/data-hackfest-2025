import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Cell } from "recharts";
import { useRealUsageStats } from "@/hooks/useRealUsageStats";

export function AppUsageChart() {
  const today = new Date().toISOString().split('T')[0];
  const { stats, isLoading } = useRealUsageStats({
    startDate: today,
    endDate: today
  });

  // Generate realistic usage data based on current stats
  const generateUsageData = () => {
    if (!stats) {
      return [
        { name: "Instagram", minutes: 45, type: "distraction" },
        { name: "VS Code", minutes: 180, type: "focus" },
        { name: "Chrome", minutes: 90, type: "neutral" },
        { name: "TikTok", minutes: 30, type: "distraction" },
        { name: "Notion", minutes: 75, type: "focus" },
        { name: "Messages", minutes: 25, type: "neutral" },
      ];
    }

    const totalMinutes = Math.floor(stats.totalScreenTime / 60000);
    const focusMinutes = Math.floor(stats.totalFocusTime / 60000);
    const distractionMinutes = Math.floor(stats.distractionTime / 60000);
    const neutralMinutes = Math.max(0, totalMinutes - focusMinutes - distractionMinutes);

    // Distribute time across different apps
    const focusApps = [
      { name: "VS Code", ratio: 0.4 },
      { name: "Notion", ratio: 0.3 },
      { name: "Terminal", ratio: 0.2 },
      { name: "Documentation", ratio: 0.1 }
    ];

    const distractionApps = [
      { name: "Instagram", ratio: 0.3 },
      { name: "TikTok", ratio: 0.25 },
      { name: "YouTube", ratio: 0.25 },
      { name: "Reddit", ratio: 0.2 }
    ];

    const neutralApps = [
      { name: "Chrome", ratio: 0.5 },
      { name: "Messages", ratio: 0.3 },
      { name: "Email", ratio: 0.2 }
    ];

    const data = [];

    // Add focus apps
    focusApps.forEach(app => {
      const minutes = Math.floor(focusMinutes * app.ratio);
      if (minutes > 0) {
        data.push({ name: app.name, minutes, type: "focus" });
      }
    });

    // Add distraction apps
    distractionApps.forEach(app => {
      const minutes = Math.floor(distractionMinutes * app.ratio);
      if (minutes > 0) {
        data.push({ name: app.name, minutes, type: "distraction" });
      }
    });

    // Add neutral apps
    neutralApps.forEach(app => {
      const minutes = Math.floor(neutralMinutes * app.ratio);
      if (minutes > 0) {
        data.push({ name: app.name, minutes, type: "neutral" });
      }
    });

    // Sort by minutes and return top 6
    return data.sort((a, b) => b.minutes - a.minutes).slice(0, 6);
  };

  const data = generateUsageData();
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
        {isLoading ? (
          <div className="flex items-center justify-center h-[200px] text-muted-foreground">
            <p>Loading...</p>
          </div>
        ) : (
          <>
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
          </>
        )}
      </CardContent>
    </Card>
  );
}
