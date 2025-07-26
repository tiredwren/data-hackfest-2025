import { useMemo } from 'react';

interface HeatmapData {
  day: string;
  hour: number;
  value: number;
}

export function UsageHeatmap() {
  const heatmapData = useMemo(() => {
    const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    const data: HeatmapData[] = [];
    
    days.forEach(day => {
      for (let hour = 0; hour < 24; hour++) {
        // Generate mock data with realistic patterns
        let value = 0;
        if (hour >= 6 && hour <= 23) { // Active hours
          if (hour >= 9 && hour <= 17) { // Work hours
            value = Math.random() * 0.7 + 0.3; // Higher activity
          } else if (hour >= 19 && hour <= 22) { // Evening
            value = Math.random() * 0.5 + 0.4;
          } else {
            value = Math.random() * 0.4;
          }
        }
        data.push({ day, hour, value });
      }
    });
    
    return data;
  }, []);

  const getIntensityColor = (value: number) => {
    if (value === 0) return 'bg-muted';
    if (value < 0.25) return 'bg-focus/20';
    if (value < 0.5) return 'bg-focus/40';
    if (value < 0.75) return 'bg-focus/60';
    return 'bg-focus/80';
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-25 gap-1 text-xs">
        {/* Hour labels */}
        <div></div>
        {Array.from({ length: 24 }, (_, i) => (
          <div key={i} className="text-center text-muted-foreground text-[10px]">
            {i % 6 === 0 ? `${i}h` : ''}
          </div>
        ))}
        
        {/* Heatmap cells */}
        {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map(day => (
          <>
            <div key={`${day}-label`} className="text-muted-foreground text-[10px] flex items-center">
              {day}
            </div>
            {Array.from({ length: 24 }, (_, hour) => {
              const dataPoint = heatmapData.find(d => d.day === day && d.hour === hour);
              return (
                <div
                  key={`${day}-${hour}`}
                  className={`w-3 h-3 rounded-sm ${getIntensityColor(dataPoint?.value || 0)} border border-background`}
                  title={`${day} ${hour}:00 - ${Math.round((dataPoint?.value || 0) * 100)}% activity`}
                />
              );
            })}
          </>
        ))}
      </div>
      
      {/* Legend */}
      <div className="flex items-center gap-2 text-xs text-muted-foreground">
        <span>Less</span>
        <div className="flex gap-1">
          <div className="w-3 h-3 bg-muted rounded-sm"></div>
          <div className="w-3 h-3 bg-focus/20 rounded-sm"></div>
          <div className="w-3 h-3 bg-focus/40 rounded-sm"></div>
          <div className="w-3 h-3 bg-focus/60 rounded-sm"></div>
          <div className="w-3 h-3 bg-focus/80 rounded-sm"></div>
        </div>
        <span>More</span>
      </div>
    </div>
  );
}