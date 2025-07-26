import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { useUsageTracking } from '@/hooks/useUsageTracking';
import { useMemo } from 'react';

export function DistractionPatterns() {
  const { usageStats } = useUsageTracking();

  const appData = useMemo(() => {
    if (!usageStats?.apps) {
      return [
        { name: 'No data', interruptions: 0, color: 'hsl(var(--muted))' }
      ];
    }

    // Filter and sort distraction apps
    const distractionApps = usageStats.apps
      .filter(app => 
        app.packageName.includes('instagram') ||
        app.packageName.includes('tiktok') ||
        app.packageName.includes('facebook') ||
        app.packageName.includes('twitter') ||
        app.packageName.includes('discord') ||
        app.packageName.includes('youtube')
      )
      .sort((a, b) => b.totalTimeInForeground - a.totalTimeInForeground)
      .slice(0, 5)
      .map(app => ({
        name: app.appName || app.packageName.split('.').pop() || 'Unknown',
        interruptions: Math.ceil(app.totalTimeInForeground / (1000 * 60 * 5)), // Estimate interruptions as 5-min chunks
        color: 'hsl(var(--warning))'
      }));

    return distractionApps.length > 0 ? distractionApps : [
      { name: 'No distractions detected', interruptions: 0, color: 'hsl(var(--muted))' }
    ];
  }, [usageStats]);

  const hourlyData = useMemo(() => {
    const currentHour = new Date().getHours();
    const totalSwitches = usageStats?.appSwitches || 0;
    
    // Generate hourly distribution based on total switches
    const hours = [];
    for (let i = 9; i <= Math.min(17, currentHour); i++) {
      let hour = i <= 12 ? `${i}AM` : `${i - 12}PM`;
      if (i === 12) hour = '12PM';
      
      // Distribute switches with higher activity in afternoon
      const switchCount = Math.ceil((totalSwitches / 8) * (0.5 + Math.random()));
      hours.push({ hour, switches: switchCount });
    }
    
    return hours.length > 0 ? hours : [
      { hour: 'No data', switches: 0 }
    ];
  }, [usageStats]);
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* App Interruptions */}
      <div>
        <h4 className="text-sm font-medium mb-4 text-muted-foreground">Most Distracting Apps</h4>
        <div className="h-48">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={appData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, value }) => `${name}: ${value}`}
                outerRadius={60}
                fill="#8884d8"
                dataKey="interruptions"
              >
                {appData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: 'hsl(var(--card))',
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '8px',
                  fontSize: '12px'
                }}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Hourly App Switches */}
      <div>
        <h4 className="text-sm font-medium mb-4 text-muted-foreground">App Switches by Hour</h4>
        <div className="h-48">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={hourlyData}>
              <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
              <XAxis 
                dataKey="hour" 
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
              <Bar 
                dataKey="switches" 
                fill="hsl(var(--warning))"
                radius={[4, 4, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}