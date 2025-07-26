import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const mockData = [
  { day: 'Mon', focus: 65, distraction: 35 },
  { day: 'Tue', focus: 45, distraction: 55 },
  { day: 'Wed', focus: 78, distraction: 22 },
  { day: 'Thu', focus: 52, distraction: 48 },
  { day: 'Fri', focus: 38, distraction: 62 },
  { day: 'Sat', focus: 82, distraction: 18 },
  { day: 'Sun', focus: 71, distraction: 29 },
];

export function FocusTrendsChart() {
  return (
    <div className="h-64">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={mockData}>
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