import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { useUsageTracking } from '@/hooks/useUsageTracking';
import { useMemo } from 'react';

export function FocusTrendsChart() {
  const { usageStats } = useUsageTracking();

  const chartData = useMemo(() => {
    if (!usageStats) {
      return [{ day: 'Today', focus: 0, distraction: 0 }];
    }

    const totalTime = usageStats.totalScreenTime;
    const focusPercentage = totalTime > 0 ? Math.round((usageStats.focusTime / totalTime) * 100) : 0;
    const distractionPercentage = totalTime > 0 ? Math.round((usageStats.distractionTime / totalTime) * 100) : 0;

    // Generate mock week data with today's actual data as the last point
    const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    return days.map((day, index) => {
      if (index === 6) { // Sunday (today)
        return { day, focus: focusPercentage, distraction: distractionPercentage };
      }
      // Generate realistic variation for other days
      const baseFocus = focusPercentage + (Math.random() - 0.5) * 20;
      const focus = Math.max(0, Math.min(100, baseFocus));
      return { day, focus: Math.round(focus), distraction: Math.round(100 - focus) };
    });
  }, [usageStats]);
  return (
    <div className="h-64">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
          <XAxis 
            dataKey="day" 
            axisLine={false}
            tickLine={false}
            className="text-xs fill-muted-foreground"
          />
          <YAxis 
            axisLine={false}
            tickLine={false}
            className="text-xs fill-muted-foreground"
          />
          <Tooltip 
            contentStyle={{ 
              backgroundColor: 'hsl(var(--card))',
              border: '1px solid hsl(var(--border))',
              borderRadius: '8px',
              fontSize: '12px'
            }}
          />
          <Line 
            type="monotone" 
            dataKey="focus" 
            stroke="hsl(var(--focus))" 
            strokeWidth={3}
            dot={{ fill: 'hsl(var(--focus))', strokeWidth: 2, r: 4 }}
            name="Focus Time %"
          />
          <Line 
            type="monotone" 
            dataKey="distraction" 
            stroke="hsl(var(--warning))" 
            strokeWidth={3}
            dot={{ fill: 'hsl(var(--warning))', strokeWidth: 2, r: 4 }}
            name="Distraction Time %"
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}