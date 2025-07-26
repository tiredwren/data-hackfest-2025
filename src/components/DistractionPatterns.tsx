import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

const appData = [
  { name: 'Instagram', interruptions: 24, color: 'hsl(var(--warning))' },
  { name: 'Discord', interruptions: 18, color: 'hsl(var(--warning))' },
  { name: 'TikTok', interruptions: 15, color: 'hsl(var(--warning))' },
  { name: 'YouTube', interruptions: 12, color: 'hsl(var(--warning))' },
  { name: 'Twitter', interruptions: 8, color: 'hsl(var(--warning))' },
];

const hourlyData = [
  { hour: '9AM', switches: 3 },
  { hour: '10AM', switches: 5 },
  { hour: '11AM', switches: 2 },
  { hour: '12PM', switches: 8 },
  { hour: '1PM', switches: 12 },
  { hour: '2PM', switches: 15 },
  { hour: '3PM', switches: 10 },
  { hour: '4PM', switches: 7 },
  { hour: '5PM', switches: 9 },
];

export function DistractionPatterns() {
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